export function pathResolver(paths: string[]): string {
  const resolvedPaths = paths.map((path) => resolvingPathString(path));
  return resolvedPaths.join('');
}

function resolvingPathString(path: string) {
  path = path.trim();
  let resolvePath = path.startsWith('/') ? path : ['/', path].join('');
  resolvePath = resolvePath.endsWith('/') ? resolvePath.slice(0, resolvePath.length - 1) : resolvePath;
  return resolvePath;
}