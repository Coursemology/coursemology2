require 'rails_helper'

RSpec.describe 'Course management', type: :feature do
  subject { page }

  let!(:user) { create(:user, role: :administrator) }
  before { login_as(user, scope: :user) }

  describe 'course new page' do
    before { visit new_course_path }

    it { is_expected.to have_field('course_title') }
    it { is_expected.to have_field('course_description') }
  end

  describe 'course creation' do
    before { visit new_course_path }

    context 'with invalid information' do
      it 'does not create a course' do
        expect { click_button 'Create' }.not_to change(Course.unscoped, :count)
      end
    end

    context 'with valid information' do
      before { fill_in 'course_title', with: 'Lorem ipsum' }

      it 'creates a course' do
        expect { click_button 'Create' }.to change(Course.unscoped, :count).by(1)
      end
    end
  end

  describe 'course editing' do
    let(:instance) { create(:instance) }

    with_tenant(:instance) do
      let!(:course) { create(:course) }
      before { visit edit_course_path(course) }

      context 'with valid information' do
        let(:new_title) { 'New Title' }
        let(:new_description) { 'New Description' }

        before do
          fill_in 'course_title',          with: new_title
          fill_in 'course_description',    with: new_description
          click_button 'Update'
        end

        it 'changes the attributes' do
          expect(course.reload.title).to eq(new_title)
          expect(course.reload.description).to eq(new_description)
        end
      end

      context 'with empty title' do
        before do
          fill_in 'course_title', with: ''
          click_button 'Update'
        end

        it 'does not change title' do
          expect(course.reload.title).not_to eq('')
        end

        it 'shows the error' do
          expect(page).to have_css('div.has-error')
        end
      end
    end
  end
end
