require 'rails_helper'

RSpec.describe ApplicationHelper, type: :helper do
  describe 'sidebar navigation' do
    it 'defaults to not having a sidebar' do
      expect(helper.has_sidebar?).to eq(false)
    end

    describe '#sidebar!' do
      it 'sets #has_sidebar?' do
        helper.sidebar!
        expect(helper.has_sidebar?).to eq(true)
      end
    end

    describe '#sidebar' do
      it 'sets #has_sidebar?' do
        helper.sidebar do
          ''
        end
        expect(helper.has_sidebar?).to eq(true)
      end

      it 'accepts a block as the sidebar contents' do
        result = helper.sidebar do
          'Test Contents'
        end
        expect(result).to include('Test Contents')
      end
    end
  end

  describe 'sidebar items' do
    let(:sidebar_items) do
      [
        {
          title: 'Announcements',
          path: 'courses/1/announcements',
          unread: 1
        },
        {
          title: 'Levels',
          path: 'courses/1/levels'
        }
      ]
    end

    describe '#link_to_sidebar_item' do
      let(:sidebar_item) { sidebar_items.sample }
      subject { helper.link_to_sidebar_item(sidebar_item) }

      it 'generates a link with title' do
        expect(subject).to have_tag('a', text: /^#{sidebar_item[:title]}/)
        expect(subject).to have_tag('a', with: { href: sidebar_item[:path] })
      end

      it 'shows the unread badge' do
        if sidebar_item[:unread]
          expect(subject).to have_tag('span.unread') do
            with_tag 'span.badge', text: sidebar_item[:unread]
          end
        else
          expect(subject).to have_tag('span.unread')
        end
      end
    end

    describe '#sidebar_items' do
      subject { helper.sidebar_items(sidebar_items) }

      it 'displays all the sidebar items' do
        expect(subject).to have_tag('ul.nav.nav-pills.nav-stacked')
        sidebar_items.each do |item|
          expect(subject).to have_tag('li') do
            with_tag('a', text: /^#{item[:title]}/)
            with_tag('a', with: { href: item[:path] })
          end
        end
      end
    end
  end

  describe 'user display helper' do
    describe '#display_user' do
      let(:user) { build(:user) }
      subject { helper.display_user(user) }

      it 'displays the user\'s name' do
        expect(subject).to eq(user.name)
      end
    end

    describe '#link_to_user' do
      let(:user) { build(:user) }
      subject { helper.link_to_user(user) }

      it { is_expected.to have_tag('a') }

      context 'when no block is given' do
        it { is_expected.to include(helper.display_user(user)) }
      end

      context 'when a block is given' do
        subject do
          helper.link_to_user(user) do
            'Test'
          end
        end

        it { is_expected.to include('Test') }
      end
    end

    describe '#time_period_class' do
      let(:stub) do
        result = Object.new
        valid_from = self.valid_from
        valid_to = self.valid_to
        result.define_singleton_method(:not_yet_valid?) { Time.zone.now < valid_from }
        result.define_singleton_method(:currently_valid?) do
          Time.zone.now >= valid_from && Time.zone.now <= valid_to
        end
        result.define_singleton_method(:expired?) { Time.zone.now > valid_to }
        result
      end
      subject { helper.time_period_class(stub) }

      context 'when the object is not yet valid' do
        let(:valid_from) { Time.zone.now + 1.day }
        let(:valid_to) { Time.zone.now + 2.days }
        it { is_expected.to eq('not-yet-valid') }
      end

      context 'when the object is currently valid' do
        let(:valid_from) { Time.zone.now - 1.day }
        let(:valid_to) { Time.zone.now + 1.day }
        it { is_expected.to eq('currently-valid') }
      end

      context 'when the object is expired' do
        let(:valid_from) { Time.zone.now - 1.week }
        let(:valid_to) { Time.zone.now - 1.day }
        it { is_expected.to eq('expired') }
      end
    end
  end

  describe 'page title helper' do
    subject { helper.page_title }

    context 'when the page title is not set' do
      it { is_expected.to eq(t('layout.coursemology')) }
    end

    context 'when the page title is explicitly set' do
      let(:test_title) { 'this is a test' }
      before { helper.content_for(:page_title, test_title) }
      it { is_expected.to eq("#{test_title} - #{t('layout.coursemology')}") }
    end

    context 'when there are breadcrumbs present' do
      let!(:breadcrumbs) { ['a', 'b', 'c'] }
      before do
        bc = breadcrumbs
        helper.define_singleton_method(:breadcrumb_names) { bc }
      end
      it { is_expected.to eq("#{breadcrumbs.reverse.join(' - ')} - #{t('layout.coursemology')}") }
    end
  end

  describe '#page_header' do
    context 'when custom header text is provided' do
      let(:header) { 'Custom header' }
      subject { helper.page_header(header) }

      it 'shows the custom header text' do
        expect(subject).to have_tag('div h1 span', text: header)
      end
    end
  end
end
