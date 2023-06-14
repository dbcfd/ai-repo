import {createContext, useContext, useMemo} from "react";
import {AuthContext} from "../auth";
import { Configuration, OpenAIApi } from "openai";

type OpenAIMemo = {
    api: OpenAIApi
}

export const OpenAIContext = createContext<OpenAIMemo>(null)

export function OpenAI({children}) {
    const user = useContext(AuthContext).user

    const configuration = new Configuration({
        apiKey: user.apiKey,
    });

    const api = new OpenAIApi(configuration);
    const value = useMemo(() => ({
        api
    }), [api])

    return (
        <OpenAIContext.Provider value={value}>
            {children}
        </OpenAIContext.Provider>
    )
}