import ErrorPage from './error-page';

export default function Error502() {
    return (
        <ErrorPage
            code={502}
            title="Bad Gateway"
            description="A gateway server received an invalid response from an upstream server while loading this page."
        />
    );
}
