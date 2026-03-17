import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/hillbcs-logo.png" alt="HillBcs" {...props} />;
}
