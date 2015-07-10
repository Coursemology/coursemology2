require 'rails_helper'

RSpec.describe 'Course: Achievements' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    describe 'achievement creation' do
      before { visit new_course_achievement_path(course) }
      subject { click_button I18n.t('helpers.submit.achievement.create') }

      context 'with invalid information' do
        before { subject }

        it 'stays on the same page' do
          expect(page).to have_button('helpers.submit.achievement.create')
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:achievement) { build(:course_achievement, course: course) }

        before do
          fill_in 'achievement_title',    with: achievement.title
          fill_in 'achievement_description',  with: achievement.description
        end

        it 'creates an achievement' do
          expect { subject }.to change(course.achievements, :count).by(1)
        end

        context 'after creation' do
          before { subject }

          it 'shows the success message' do
            expect(page).to have_selector('div', text: I18n.t('course.achievements.create.success'))
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
        it { is_expected.to have_field('achievement_title', with: achievement.title) }
        it 'shows achievement description' do
          expect(page).to have_field('achievement_description',
                                     with: achievement.description)
        end
        it { is_expected.to have_checked_field('achievement_published') }
      end

      context 'with invalid information' do
        before do
          fill_in 'achievement_title', with: ''
          subject
        end
        subject { click_button I18n.t('helpers.submit.achievement.update') }

        it 'stays on the same page' do
          expect(page).to have_button('helpers.submit.achievement.update')
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:new_title)  { 'New Title' }
        let(:new_description) { 'New description' }

        before do
          fill_in 'achievement_title',        with: new_title
          fill_in 'achievement_description',      with: new_description
          click_button I18n.t('helpers.submit.achievement.update')
        end

        it 'redirects the user to index page' do
          expect(current_path).to eq course_achievements_path(course)
        end

        it 'shows the success message' do
          expect(page).to have_selector('div', 'course.achievements.update.success')
        end

        it 'changes the attributes' do
          expect(achievement.reload.title).to eq(new_title)
          expect(achievement.reload.description).to eq(new_description)
        end
      end

      context 'achievement achievement conditions' do
        let(:achievement) { create(:course_achievement, course: course) }
        it do
          is_expected.to have_selector(:link_or_button,
                                       'course.condition.achievements.new.header')
        end
        context 'creating an achievement condition' do
          before do
            click_link 'course.condition.achievements.new.header'
            expect(current_path).to eq(new_course_achievement_condition_achievement_path(course, achievement))
            find('#condition_achievement_achievement_id').
              find(:css, "option[value='#{achievement.id}']").
              select_option
            click_button 'helpers.submit.condition_achievement.create'
          end
          it 'creates an achievement condition correctly' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: achievement.title)
          end
        end
        context 'editing and deleting' do
          let!(:achievement_which_is_condition) { create(:course_achievement, course: course) }
          let(:achievement_condition) do
            create(:course_condition_achievement,
                   course: course, achievement: achievement_which_is_condition)
          end
          let!(:some_other_achievement) { create(:course_achievement, course: course) }
          let!(:achievement) do
            create(:course_achievement, course: course, conditions: [achievement_condition])
          end

          it 'editing an achievement condition' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)',
                                          text: achievement_which_is_condition.title)
            condition_edit_path =
              edit_course_achievement_condition_achievement_path(course,
                                                                 achievement,
                                                                 achievement_condition)
            find_link(nil, href: condition_edit_path).click

            find('#condition_achievement_achievement_id').
              find(:css, "option[value='#{some_other_achievement.id}']").
              select_option
            click_button 'helpers.submit.condition_achievement.update'
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)',
                                          text: some_other_achievement.title)
          end

          it 'deleting an achievement condition' do
            condition_delete_path =
              course_achievement_condition_achievement_path(course, achievement,
                                                            achievement_condition)
            expect do
              find_link(nil, href: condition_delete_path).click
            end.to change { achievement.conditions.count }.by(-1)
            expect(page).not_to have_selector('tr.condition > td:nth-child(2)',
                                              text: achievement_which_is_condition.title)
          end
        end
      end

      context 'achievement level conditions' do
        it do
          is_expected.to have_selector(:link_or_button,
                                       'course.condition.levels.new.header')
        end
        context 'creating a level condition' do
          before do
            click_link I18n.t('course.condition.levels.new.header')
            expect(current_path).to eq(new_course_achievement_condition_level_path(course,
                                                                                   achievement))
            fill_in 'minimum_level', with: '10'
            click_button 'helpers.submit.condition_level.create'
          end
          it 'creates a level condition correctly' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '10')
          end
        end

        context 'editing and deleting' do
          let(:level_condition) { create(:course_condition_level, course: course) }
          let!(:achievement) do
            create(:course_achievement, course: course, conditions: [level_condition])
          end

          it 'editing a level condition' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '1')
            condition_edit_path = edit_course_achievement_condition_level_path(course,
                                                                               achievement,
                                                                               level_condition)
            find_link(nil, href: condition_edit_path).click
            fill_in 'minimum_level', with: '13'
            click_button 'helpers.submit.condition_level.update'
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '13')
          end

          it 'deleting a level condition' do
            condition_delete_path = course_achievement_condition_level_path(course,
                                                                            achievement,
                                                                            level_condition)
            expect do
              find_link(nil, href: condition_delete_path).click
            end.to change { achievement.conditions.count }.by(-1)
            expect(page).not_to have_selector('tr.condition > td:nth-child(2)', text: '1')
          end
        end
      end

      context 'achievement level conditions' do
        it do
          is_expected.to have_selector(:link_or_button, 'course.condition.levels.new.header')
        end
        context 'creating a level condition' do
          before do
            click_link I18n.t('course.condition.levels.new.header')
            expect(current_path).to eq(new_course_achievement_condition_level_path(course,
                                                                                   achievement))
            fill_in 'minimum_level', with: '10'
            click_button 'helpers.submit.condition_level.create'
          end
          it 'creates a level condition correctly' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '10')
          end
        end

        context 'editing and deleting' do
          let(:level_condition) { create(:course_condition_level, course: course) }
          let!(:achievement) do
            create(:course_achievement, course: course, conditions: [level_condition])
          end

          it 'editing a level condition' do
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '1')
            condition_edit_path = edit_course_achievement_condition_level_path(course,
                                                                               achievement,
                                                                               level_condition)
            find_link(nil, href: condition_edit_path).click
            fill_in 'minimum_level', with: '13'
            click_button 'helpers.submit.condition_level.update'
            expect(current_path).to eq edit_course_achievement_path(course, achievement)
            expect(page).to have_selector('tr.condition > td:nth-child(2)', text: '13')
          end

          it 'deleting a level condition' do
            condition_delete_path = course_achievement_condition_level_path(course,
                                                                            achievement,
                                                                            level_condition)
            expect do
              find_link(nil, href: condition_delete_path).click
            end.to change { achievement.conditions.count }.by(-1)
            expect(page).not_to have_selector('tr.condition > td:nth-child(2)', text: '1')
          end
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
          find_link(nil, href: achievement_path, between: 2..2).click
        end.to change(course.achievements, :count).by(-1)
      end

      context 'after achievement deleted' do
        before { find_link(nil, href: achievement_path, between: 2..2).click }

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.t('course.achievements.destroy.success'))
        end
      end
    end
  end
end
