import { fileURLToPath } from 'node:url'
import * as SkillFilesystem from '@deepseek-ai/dsh-skill-filesystem'

export const name = 'minigame-skills'

export function apply(ctx) {
  return ctx.plugin(SkillFilesystem, {
    providerName: 'minigame',
    includeDefaultRoots: false,
    customSkillDirs: [fileURLToPath(new URL('skills/', import.meta.url))],
    watch: false,
  })
}