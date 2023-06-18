import {createContext, ReactNode, useContext, useMemo} from "react";
import {AuthContext} from "../auth";
import { Configuration, OpenAIApi } from "openai";

type OpenAIMemo = {
    api: OpenAIApi
}

function connectOpenAI(key: string): OpenAIApi {
    console.log(`Creating open ai with key ${key}`)
    const configuration = new Configuration({
        apiKey: key,
        formDataCtor: CustomFormData
    });
    return new OpenAIApi(configuration);
}

class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export const OpenAIContext = createContext<OpenAIMemo>({
    api: connectOpenAI("fix-me")
})

export function OpenAI({children}: { children: ReactNode }) {
    const { api } = useContext(AuthContext)

    const value = useMemo(() => {
        // if (!auth || !auth.openAIKey) {
        //     return null
        // }
        return ({
            api: connectOpenAI(api.openAIKey)
        })
    }, [api])

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