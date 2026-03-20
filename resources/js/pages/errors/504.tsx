import ErrorPage from './error-page';

export default function Error504() {
    return (
        <ErrorPage
            code={504}
            title="Gateway Timeout"
            description="A gateway server timed out waiting for another server to respond. Please try again shortly."
        />
    );
}
