const fs = require('fs');
let content = fs.readFileSync('src/components/reading-selection.tsx', 'utf8');
content = content.replace(/<<<<<<< Updated upstream\nimport \{ usePlan \} from '@\/context\/PlanProvider';\nimport \{ Card, CardContent \} from '@\/components\/ui\/card';\nimport \{ Button \} from '@\/components\/ui\/button';\nimport \{ useTranslations \} from 'next-intl';\nimport \{ splitPassage \} from '@\/lib\/planConstants';\n=======\nimport \{ usePlan \} from "@\/context\/PlanProvider";\nimport \{ Card, CardContent \} from "@\/components\/ui\/card";\nimport \{ Button \} from "@\/components\/ui\/button";\nimport \{ useTranslations \} from "next-intl";\nimport \{ splitPassage \} from "@\/lib\/planConstants";\nimport \{ useWebHaptics \} from "web-haptics\/react";\n>>>>>>> Stashed changes/g, `import { usePlan } from '@/context/PlanProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { splitPassage } from '@/lib/planConstants';
import { useWebHaptics } from 'web-haptics/react';`);

content = content.replace(/<<<<<<< Updated upstream\n  const t = useTranslations\('books'\);\n=======\n  const haptic = useWebHaptics\(\);\n  const t = useTranslations\("books"\);\n>>>>>>> Stashed changes/g, `  const haptic = useWebHaptics();
  const t = useTranslations('books');`);

content = content.replace(/<<<<<<< Updated upstream\n            onClick=\{\(\) => toggleRead\(desc, id\)\}\n            variant=\{read \? 'secondary' : 'default'\}\n=======\n            onClick=\{handleClick\}\n            variant=\{read \? "secondary" : "default"\}\n>>>>>>> Stashed changes/g, `            onClick={handleClick}
            variant={read ? 'secondary' : 'default'}`);

fs.writeFileSync('src/components/reading-selection.tsx', content);
