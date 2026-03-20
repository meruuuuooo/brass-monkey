import ErrorPage from './error-page';

export default function Error503() {
    return (
        <ErrorPage
            code={503}
            title="Service Unavailable"
            description="The service is temporarily unavailable, usually because of maintenance or heavy traffic. Please try again soon."
        />
    );
}
