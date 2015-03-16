require 'rails_helper'

RSpec.describe 'Global announcements', type: :feature do
  subject { page }
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe 'no global announcements' do
      before do
        instance.announcements.clear
        visit root_path
      end

      it { is_expected.not_to have_tag('div.global-announcement') }
    end

    describe 'one valid global announcement' do
      let(:announcement) { build(:instance_announcement, instance: instance) }
      before do
        instance.announcements.clear
        announcement.save!
        visit root_path
      end

      it 'shows the announcement' do
        expect(page).to have_tag('div.global-announcement') do
          have_tag('div.panel-heading', with_text: announcement.title)
          have_tag('div.panel-body', with_text: announcement.content)
        end
      end
    end

    describe 'many valid global announcements' do
      let(:announcements) { build_list(:instance_announcement, 2, instance: instance) }
      before do
        instance.announcements.clear
        announcements.each(&:save!)
        visit root_path
      end

      it 'shows the latest announcement' do
        announcement = announcements.last
        expect(page).to have_tag('div.global-announcement') do
          have_tag('div.panel-heading', with_text: announcement.title)
          have_tag('div.panel-body', with_text: announcement.content)
        end
      end

      it 'shows the more announcements link' do
        expect(page).to have_tag('div.global-announcement') do
          have_tag('div.panel-footer',
                   with_text: I18n.t('layouts.global_announcements.more_announcements'))
        end
      end
    end
  end
end
