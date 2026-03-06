import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='显示设置'
      desc='自定义应用的外观。自动切换日间和夜间主题。'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
