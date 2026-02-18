export const HIDDEN_LAYOUT_ROUTES = ["/auth/login", "/auth/register", "/contacto"];

export function shouldHideLayout(pathname: string): boolean {
    return HIDDEN_LAYOUT_ROUTES.includes(pathname);
}
