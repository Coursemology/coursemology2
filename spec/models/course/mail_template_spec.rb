require 'rails_helper'

RSpec.describe Course::MailTemplate, type: :model do
  it { is_expected.to belong_to(:course) }
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:invitation) { create(:invitation) }

    describe '.template_content' do
      subject { Course::MailTemplate.template_content(@course, @action, @part) }

      before do
        @course = invitation.course
      end

      context 'the template is not found' do
        it { is_expected.to be_nil }
      end

      context 'the template is found' do
        before do
          @action = invitation.action
        end

        context 'template part is not customized' do
          before do
            @part = :pre_message
          end

          it { is_expected.to be_nil }
        end

        context 'template part is customized' do
          before do
            @part = :subject
          end

          it { is_expected.to eq(invitation.subject) }
        end
      end
    end
  end
end
