import { CKEditor } from '@ckeditor/ckeditor5-react';
import type { FileLoader, UploadAdapter, UploadResponse } from 'ckeditor5';
import ClassicEditor from 'coursemology-ckeditor';

import attachmentsAPI from 'api/Attachments';

import 'coursemology-ckeditor/build/index.css';
import './CKEditor.css';

class SimpleUploadAdapter implements UploadAdapter {
  private loader: FileLoader;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  async upload(): Promise<UploadResponse> {
    const file = await this.loader.file;
    if (file === null) return {};

    const data = (await attachmentsAPI.create(file)).data;
    if (!data.success) return {};

    return { default: `/attachments/${data.id}` };
  }
}

const CKEditorField = ({
  placeholder,
  disabled,
  value,
  autoFocus,
  onChange,
  onBlur,
  onFocus,
}: {
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}): JSX.Element => (
  <CKEditor
    config={{ placeholder }}
    data={value}
    disabled={disabled}
    editor={ClassicEditor}
    onBlur={onBlur}
    onChange={(_, editor) => onChange?.(editor.getData())}
    onFocus={onFocus}
    onReady={(editor) => {
      editor.plugins.get('FileRepository').createUploadAdapter = (
        loader,
      ): UploadAdapter => new SimpleUploadAdapter(loader);

      if (autoFocus) editor.focus();
    }}
  />
);

export default CKEditorField;
