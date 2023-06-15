import {createContext, useContext, useMemo} from "react";
import {AuthContext} from "../auth";
import { Configuration, OpenAIApi } from "openai";

type OpenAIMemo = {
    api: OpenAIApi
}

export const OpenAIContext = createContext<OpenAIMemo>(null)

export function OpenAI({children}) {
    const auth = useContext(AuthContext).auth

    const value = useMemo(() => {
        if (!auth) {
            return <div>OpenAI can only be used inside of an Auth context</div>
        }

        if (!auth.apiKey) {
            return <div>OpenAI used without api key being set</div>
        }

        const configuration = new Configuration({
            apiKey: auth.apiKey,
        });
        const api = new OpenAIApi(configuration);
        return ({
            api
        })
    }, [auth])

    return (
        <OpenAIContext.Provider value={value}>
            {children}
        </OpenAIContext.Provider>
    )
}