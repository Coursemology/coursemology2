require 'rails_helper'

describe 'Announcement management' do
  subject { page }

  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let!(:user) { create(:user, role: :administrator) }
    let!(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    describe 'announcement creation' do
      before { visit new_course_announcement_path(course) }

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
        let(:announcement) { build(:course_announcement, course: course) }

        before do
          fill_in 'course_announcement_title',    with: announcement.title
          fill_in 'course_announcement_content',  with: announcement.content
        end

        it 'creates an announcement' do
          expect { click_button 'Create' }.to change(Course::Announcement, :count).by(1)
        end

        context 'after creation' do
          before { click_button 'Create' }

          it 'shows the success message' do
            expect(page).to have_selector('div',
                                          text: I18n.translate('course.announcements.create.notice',
                                                               title: announcement.title))
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
        end
      end

      context 'with invalid information' do
        before do
          fill_in 'course_announcement_title', with: ''
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
        let(:new_content) { 'New content' }

        before do
          fill_in 'course_announcement_title',        with: new_title
          fill_in 'course_announcement_content',      with: new_content
          click_button 'Update'
        end

        it 'redirects the user to index page' do
          expect(current_path).to eq course_announcements_path(course)
        end

        it 'shows the success message' do
          expect(page).to have_selector('div',
                                        text: I18n.translate('course.announcements.update.notice',
                                                             title: new_title))
        end

        it 'changes the attributes' do
          expect(announcement.reload.title).to eq(new_title)
          expect(announcement.reload.content).to eq(new_content)
        end
      end
    end

    describe 'index' do
      let!(:announcements) { create_list(:course_announcement, 10, course: course) }

      before do
        visit course_announcements_path(course)
      end

      context 'management buttons' do
        it { is_expected.to have_link('New') }
      end

      it 'shows all announcements' do
        announcements.each do |announcement|
          expect(page).to have_selector('div', text: announcement.title)
          expect(page).to have_selector('div', text: announcement.content)
        end
      end

      it 'shows all management buttons' do
        announcements.each do |announcement|
          expect(page).to have_link('', href: edit_course_announcement_path(course, announcement))
          expect(page).to have_link('', href: course_announcement_path(course, announcement))
        end
      end
    end

    describe 'announcement destruction' do
      let!(:announcement) { create(:course_announcement, course: course) }
      let(:announcement_path) { course_announcement_path(course, announcement) }

      before { visit course_announcements_path(course) }

      it 'deletes the announcement' do
        expect do
          find(:xpath, "//a[@href=\"#{ announcement_path }\"]").click
        end.to change(Course::Announcement, :count).by(-1)
      end

      context 'after announcement deleted' do
        before { find(:xpath, "//a[@href=\"#{ announcement_path }\"]").click }

        it 'shows the notice message' do
          expect(page).to have_selector('div',
                                        text: I18n.translate('course.announcements.destroy.notice',
                                                             title: announcement.title))
        end
      end
    end
  end
end
