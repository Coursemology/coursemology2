require 'rails_helper'

RSpec.describe Course::Lecture, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:lectures) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let(:course) { create(:course) }

    describe 'create an lecture' do

      context 'when title is not present' do
        subject { build(:course_lecture, title: '') }

        it { is_expected.not_to be_valid }
      end
    end

    describe '#has_many_attachments' do
      # Lecture with image_tag in content.
      let(:lecture) do
        lecture = create(:course_lecture)
        attachment = create(:attachment_reference, attachable: lecture)
        content = "<img alt='Icon' src='/attachments/#{attachment.id}' />"
        lecture.update_attributes(content: content)
        lecture
      end

      it 'has an attachment_reference' do
        expect(lecture.attachment_references.count).to eq(1)
      end

      context 'when image is removed from content' do
        before do
          lecture.content = ''
          lecture.save
        end

        it 'removes the attachment_references' do
          expect(lecture.attachment_references.count).to eq(0)
        end
      end
    end
  end
end
