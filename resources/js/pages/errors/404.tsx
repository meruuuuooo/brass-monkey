import ErrorPage from './error-page';

export default function Error404() {
    return (
        <ErrorPage
            code={404}
            title="Not Found"
            description="The page you requested could not be found. The link may be broken, outdated, or the page may have been moved."
        />
    );
}
