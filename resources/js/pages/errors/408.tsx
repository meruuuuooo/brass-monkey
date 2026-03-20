import ErrorPage from './error-page';

export default function Error408() {
    return (
        <ErrorPage
            code={408}
            title="Request Timeout"
            description="The request took too long to complete and the server timed out waiting for it. Please try again."
        />
    );
}
