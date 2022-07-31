export async function getTwilioAccessToken (): Promise<string> {
    const response = await fetch('https://us-central1-scheduler-90d6a.cloudfunctions.net/api/twilio/token', {
        method: 'GET'
    });
    const { token } = await response.json();

    return token;
}