import {createContext, ReactNode, useContext, useMemo} from "react";
import {AuthContext} from "../auth";
import { Configuration, OpenAIApi } from "openai";

type OpenAIMemo = {
    api: OpenAIApi
}

export const OpenAIContext = createContext<OpenAIMemo | null>(null)

export function OpenAI({children}: { children: ReactNode }) {
    const auth = useContext(AuthContext).auth

    const value = useMemo(() => {
        if (!auth || !auth.apiKey) {
            return null
        }
        const configuration = new Configuration({
            apiKey: auth.apiKey,
        });
        const api = new OpenAIApi(configuration);
        return ({
            api
        })
    }, [auth])

    function renderWithContext(value: OpenAIMemo | null) {
        if(!value) {
            return <div>OpenAI can only be used in an authenticated context with api key set</div>
        }
        return children
    }

    return (
        <OpenAIContext.Provider value={value}>
            {renderWithContext(value)}
        </OpenAIContext.Provider>
    )
}