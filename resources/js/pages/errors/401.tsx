import ErrorPage from './error-page';

export default function Error401() {
    return (
        <ErrorPage
            code={401}
            title="Unauthorized"
            description="You need to sign in with valid credentials before accessing this page."
        />
    );
}
