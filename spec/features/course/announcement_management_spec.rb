require 'rails_helper'

RSpec.describe 'Course: Announcements', type: :feature do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:administrator) }
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    describe 'announcement creation' do
      before { visit new_course_announcement_path(course) }

      context 'with invalid information' do
        before { click_button I18n.t('helpers.submit.course_announcement.create') }

        it 'stays on the same page' do
          expect(page).to have_button(I18n.t('helpers.submit.course_announcement.create'))
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:announcement) { build(:course_announcement, course: course) }
        subject { click_button I18n.t('helpers.submit.course_announcement.create') }

        before do
          fill_in 'course_announcement_title',    with: announcement.title
          fill_in 'course_announcement_content',  with: announcement.content
        end

        it 'creates an announcement' do
          expect { subject }.to change(course.announcements, :count).by(1)
        end

        context 'after creation' do
          before { subject }

          it 'shows the success message' do
            expect(page).to have_selector('div',
                                          text: I18n.t('course.announcements.create.success'))
          end

          it 'redirects the user to the index page' do
            expect(current_path).to eq(course_announcements_path(course))
          end
        end
      end
    end

    describe 'announcement editing' do
      let!(:announcement) { create(:course_announcement, course: course) }

      before { visit edit_course_announcement_path(course, announcement) }

      context 'page rendering' do
        it { is_expected.to have_field('course_announcement_title', with: announcement.title) }
        it { is_expected.to have_field('course_announcement_content', with: announcement.content) }
        it do
          is_expected.to have_field('course_announcement[valid_from]',
                                    with: announcement.valid_from)
        end
        it do
          is_expected.to have_field('course_announcement[valid_to]', with: announcement.valid_to)
          click_button I18n.t('helpers.submit.course_announcement.update')
        end
      end

      context 'with invalid information' do
        before do
          fill_in 'course_announcement_title', with: ''
          click_button I18n.t('helpers.submit.course_announcement.update')
        end

        it 'stays on the same page' do
          expect(page).to have_button('helpers.submit.course_announcement.update')
        end

        it 'shows errors' do
          expect(page).to have_css('div.has-error')
        end
      end

      context 'with valid information' do
        let(:new_title)  { 'New Title' }
        let(:new_content) { 'New content' }

        before do
          fill_in 'course_announcement_title',        with: new_title
          fill_in 'course_announcement_content',      with: new_content
          click_button I18n.t('helpers.submit.course_announcement.update')
        end

        it 'redirects the user to index page' do
          expect(current_path).to eq course_announcements_path(course)
        end

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.t('course.announcements.update.success'))
        end

        it 'changes the attributes' do
          expect(announcement.reload.title).to eq(new_title)
          expect(announcement.reload.content).to eq(new_content)
        end
      end
    end

    describe 'index' do
      let!(:announcements) do
        create_list(:course_announcement, 10, course: course, creator: user, updater: user)
      end

      before do
        visit course_announcements_path(course)
      end

      context 'management buttons' do
        it { is_expected.to have_link(I18n.t('course.announcements.index.new')) }
      end

      it 'shows all announcements' do
        announcements.each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end

      it 'shows all management buttons' do
        announcements.each do |announcement|
          expect(page).to have_link(nil, href: edit_course_announcement_path(course, announcement))
          expect(page).to have_link(nil, href: course_announcement_path(course, announcement))
        end
      end
    end

    describe 'announcement destruction' do
      let!(:announcement) { create(:course_announcement, course: course) }
      let(:announcement_path) { course_announcement_path(course, announcement) }

      before { visit course_announcements_path(course) }

      it 'deletes the announcement' do
        expect do
          find_link(nil, href: announcement_path).click
        end.to change(course.announcements, :count).by(-1)
      end

      context 'after announcement deleted' do
        before { find_link(nil, href: announcement_path).click }

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.t('course.announcements.destroy.success'))
        end
      end
    end
  end
end
