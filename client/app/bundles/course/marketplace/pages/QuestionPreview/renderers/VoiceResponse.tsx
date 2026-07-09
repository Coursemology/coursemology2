import { RendererProps } from './types';

// Voice questions carry no type-specific setup — the prompt is the base description, which the
// shell already renders alongside the max grade in its "Question details" and "Grading" sections.
// Mirroring the native edit UI (which shows nothing extra for voice), this renderer contributes
// no section.
const VoiceResponse = (_props: RendererProps): JSX.Element | null => null;

export default VoiceResponse;
