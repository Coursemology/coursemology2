require 'rails_helper'

RSpec.describe 'Achievement management' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    describe 'achievement creation' do
      before { visit new_course_achievement_path(course) }

      context 'with invalid information' do
        before { click_button 'Create' }

        it 'stays on the same page' do
          expect(page).to have_button('Create')
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:achievement) { build(:course_achievement, course: course) }

        before do
          fill_in 'course_achievement_title',    with: achievement.title
          fill_in 'course_achievement_description',  with: achievement.description
        end

        it 'creates an achievement' do
          expect { click_button 'Create' }.to change(Course::Achievement, :count).by(1)
        end

        context 'after creation' do
          before { click_button 'Create' }

          it 'shows the success message' do
            expect(page).to have_selector('div',
                                          text: I18n.translate('course.achievements.create.notice',
                                                               title: achievement.title))
          end

          it 'redirects the user to the index page' do
            expect(current_path).to eq(course_achievements_path(course))
          end
        end
      end
    end

    describe 'achievement editing' do
      let!(:achievement) { create(:course_achievement, course: course) }

      before { visit edit_course_achievement_path(course, achievement) }

      context 'page rendering' do
        it { is_expected.to have_field('course_achievement_title', with: achievement.title) }
        it 'shows achievement description' do
          expect(page).to have_field('course_achievement_description',
                                     with: achievement.description)
        end
        it { is_expected.to have_checked_field('course_achievement_published') }
      end

      context 'with invalid information' do
        before do
          fill_in 'course_achievement_title', with: ''
          click_button 'Update'
        end

        it 'stays on the same page' do
          expect(page).to have_button('Update')
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:new_title)  { 'New Title' }
        let(:new_description) { 'New description' }

        before do
          fill_in 'course_achievement_title',        with: new_title
          fill_in 'course_achievement_description',      with: new_description
          click_button 'Update'
        end

        it 'redirects the user to index page' do
          expect(current_path).to eq course_achievements_path(course)
        end

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.translate('course.achievements.update.notice',
                                                             title: new_title))
        end

        it 'changes the attributes' do
          expect(achievement.reload.title).to eq(new_title)
          expect(achievement.reload.description).to eq(new_description)
        end
      end
    end

    describe 'achievement destruction' do
      let!(:achievement) { create(:course_achievement, course: course) }
      let(:achievement_path) { course_achievement_path(course, achievement) }

      before { visit course_achievements_path(course) }

      it 'deletes the achievement' do
        expect do
          # Show and delete have the same URL, difference is in the request method
          # find the 2nd link that matches the path [2], this is the delete button
          find(:xpath, "(//a[@href=\"#{ achievement_path }\"])[2]").click
        end.to change(Course::Achievement, :count).by(-1)
      end

      context 'after achievement deleted' do
        before { find(:xpath, "(//a[@href=\"#{ achievement_path }\"])[2]").click }

        it 'shows the notice message' do
          expect(page).to have_selector('div',
                                        text: I18n.translate('course.achievements.destroy.notice',
                                                             title: achievement.title))
        end
      end
    end
  end
end
