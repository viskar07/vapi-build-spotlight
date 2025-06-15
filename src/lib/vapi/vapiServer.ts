import jwt from 'jsonwebtoken'
import {VapiClient} from '@vapi-ai/server-sdk'

const payload = {
    orgId: process.env.VAPI_ORG_KEY!,
    token: {
        tag: 'private'
    },

}

const key = process.env.VAPI_PRIVATE_KEY!

const options= {
    expiresIn:1800
}

const token = jwt.sign(payload, key, options)


export const vapiServer = new VapiClient({token:token})