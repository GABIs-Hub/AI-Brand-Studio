const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts['db:push'] = "drizzle-kit push";
pkg.scripts['db:generate'] = "drizzle-kit generate";
pkg.scripts['db:studio'] = "drizzle-kit studio";

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
