type AppLogoProps = {
    subtitle?: string;
};

export default function AppLogo({ subtitle }: AppLogoProps) {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <img src="/hillbcs-logo.png" alt="Hill BCS Logo" className="size-10 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Hill BCS
                </span>
                {subtitle ? (
                    <span className="truncate text-[11px] font-medium tracking-[0.08em] uppercase text-sidebar-foreground/65 group-data-[collapsible=icon]:hidden">
                        {subtitle}
                    </span>
                ) : null}
            </div>
        </>
    );
}
