export const hasPathPermission = (user, path) => {
    if (!user) return false;
    if (user.role === 'agent' || user.role === 'super_admin') return true;
    if (user.role === 'sub_agent') {
        if (!user.permissions) return false;
        try {
            const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
            // Root dashboard redirect check
            if (path === '/dashboard') return true;
            return !!perms?.paths?.[path];
        } catch (e) {
            return false;
        }
    }
    return false;
};

export const hasActionPermission = (user, action) => {
    if (!user) return false;
    if (user.role === 'agent' || user.role === 'super_admin') return true;
    if (user.role === 'sub_agent') {
        if (!user.permissions) return false;
        try {
            const perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
            return !!perms?.actions?.[action];
        } catch (e) {
            return false;
        }
    }
    return false;
};
