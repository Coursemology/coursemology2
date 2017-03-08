# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VirtualClassroom, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:virtual_classrooms) }
  it { is_expected.to validate_presence_of(:title) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:user) { create(:user) }
    let(:course) { create(:course) }

    describe 'create an virtual_classroom' do
      context 'when title is not present' do
        subject { build(:course_virtual_classroom, title: '') }

        it { is_expected.not_to be_valid }
      end
    end

    describe '#has_many_attachments' do
      # VirtualClassroom with image_tag in content.
      let(:virtual_classroom) do
        virtual_classroom = create(:course_virtual_classroom)
        attachment = create(:attachment_reference, attachable: virtual_classroom)
        content = "<img alt='Icon' src='/attachments/#{attachment.id}' />"
        virtual_classroom.update_attributes(content: content)
        virtual_classroom
      end

      it 'has an attachment_reference' do
        expect(virtual_classroom.attachment_references.count).to eq(1)
      end

      context 'when image is removed from content' do
        before do
          virtual_classroom.content = ''
          virtual_classroom.save
        end

        it 'removes the attachment_references' do
          expect(virtual_classroom.attachment_references.count).to eq(0)
        end
      end
    end
  end
end
