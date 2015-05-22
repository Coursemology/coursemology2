require 'rails_helper'

RSpec.describe 'Courses', type: :feature do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    before { login_as(user, scope: :user) }

    describe 'course new page' do
      before { visit new_course_path }

      it { is_expected.to have_field('course_title') }
      it { is_expected.to have_field('course_description') }
    end

    describe 'course creation' do
      before { visit new_course_path }
      subject { click_button I18n.t('helpers.submit.course.create') }

      context 'with invalid information' do
        it 'does not create a course' do
          expect { subject }.not_to change(instance.courses, :count)
        end
      end

      context 'with valid information' do
        before { fill_in 'course_title', with: 'Lorem ipsum' }

        it 'creates a course' do
          expect { subject }.to change(instance.courses, :count).by(1)
        end
      end
    end
  end
end
