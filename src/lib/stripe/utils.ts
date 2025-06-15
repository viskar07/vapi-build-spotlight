export const getStripeOauthLink = (url: string, data:string) => {
    return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_KEY}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/${url}&state=${data}
`
}