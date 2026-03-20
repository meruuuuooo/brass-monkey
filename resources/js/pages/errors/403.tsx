import ErrorPage from './error-page';

export default function Error403() {
    return (
        <ErrorPage
            code={403}
            title="Forbidden"
            description="The server understood your request but denied access. Your account does not have permission to view this resource."
        />
    );
}
