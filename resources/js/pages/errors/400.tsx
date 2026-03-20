import ErrorPage from './error-page';

export default function Error400() {
    return (
        <ErrorPage
            code={400}
            title="Bad Request"
            description="The server could not understand your request. This can happen because of malformed input, invalid parameters, or corrupted browser data."
        />
    );
}
