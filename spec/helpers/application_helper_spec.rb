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
end
