import ErrorPage from './error-page';

export default function Error500() {
    return (
        <ErrorPage
            code={500}
            title="Internal Server Error"
            description="The server encountered an unexpected issue while processing your request. Please try again in a moment."
        />
    );
}
