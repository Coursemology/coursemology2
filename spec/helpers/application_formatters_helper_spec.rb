# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationFormattersHelper do
  describe 'text helpers' do
    before do
      subject.include(ERB::Util)
    end

    describe '#format_block_text' do
      it 'processes newlines' do
        expect(helper.format_block_text("hello\n\nthere")).to have_tag('p', text: 'there')
      end
    end

    describe '#format_inline_text' do
      it 'does not add a block element' do
        expect(helper.format_inline_text('')).to eq('')
      end
    end

    describe '#format_html' do
      it 'removes script tags' do
        expect(helper.format_html('<script/>')).to eq('')
      end

      it 'formats code' do
        html = <<-HTML
          <pre lang="python"><code>
          def hello:
            pass
          </code></pre>
        HTML
        expect(helper.format_html(html)).to have_tag('pre.codehilite')
      end

      it 'produces html_safe output' do
        expect(helper.format_html('')).to be_html_safe
      end
    end

    describe '#format_code_block' do
      let(:language) { Coursemology::Polyglot::Language::Python::Python2Point7 }
      let(:snippet) do
        <<-PYTHON
          # '1' < "2" is True
          def hello:
            pass
        PYTHON
      end
      let(:formatted_block) { helper.format_code_block(snippet, language) }

      it 'produces a pre element with the codehilite class' do
        expect(formatted_block).to have_tag('pre.codehilite')
      end

      it 'enumerates every line' do
        expect(formatted_block).to have_tag('td.line-number', count: 4)
        expect(formatted_block).to have_tag('td.line-content', count: 4)
      end

      it 'highlights the keywords' do
        expect(formatted_block).to have_tag('span.k', text: 'def')
      end

      context 'when start line number is specified' do
        let(:line_start) { 5 }
        let(:formatted_block) { helper.format_code_block(snippet, language, line_start) }

        it 'highlights the code with the given start line number' do
          expect(formatted_block).to have_tag('td.line-number', count: 4)
          expect(formatted_block).to have_tag('td.line-number', with: { 'data-line-number': '5' })
          expect(formatted_block).to have_tag('td.line-number', with: { 'data-line-number': '6' })
          expect(formatted_block).to have_tag('td.line-number', with: { 'data-line-number': '7' })
          expect(formatted_block).to have_tag('td.line-number', with: { 'data-line-number': '8' })
        end
      end

      it 'does not escape code' do
        expect(formatted_block).to have_text('<')
        expect(formatted_block).to have_text('"')
      end

      context 'when the code snippet exceeds the size or lines limit' do
        let(:snippet) do
          too_many_lines = "new line\n" * 1500
          size_too_big = 'Im 10bytes' * 6 * 1024 # 60KB

          [too_many_lines, size_too_big].sample
        end

        it 'renders an alert' do
          expect(formatted_block).to have_tag('div.alert')
        end
      end
    end

    describe '#sanitize' do
      it 'removes script tags' do
        expect(helper.sanitize('<script/>')).to eq('')
      end
    end

    describe '#simple_format' do
      it 'escapes HTML' do
        expect(helper.simple_format('<')).to have_tag('p') do
          with_text('<')
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

    describe '#display_user_image' do
      let(:user) { build_stubbed(:user) }
      subject { helper.display_user_image(user) }

      context "when the user doesn't have a profile photo" do
        it 'displays the default image' do
          expect(subject).to have_tag('img', with: { 'src^': '/assets/user_silhouette-' })
        end
      end

      context 'when the user has a profile photo' do
        let(:image) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
        before do
          file = File.open(image, 'rb')
          user.profile_photo = file
          file.close
        end

        it { is_expected.to include(user.profile_photo.medium.url) }
      end

      context 'when the user is nil' do
        let(:image) { File.join(Rails.root, '/spec/fixtures/files/picture.jpg') }
        subject { helper.display_user_image(nil) }

        it 'displays the default image' do
          expect(subject).to have_tag('img', with: { 'src^': '/assets/user_silhouette-' })
        end
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
  end

  describe 'time-bounded helper' do
    let(:stub) do
      Object.new.tap do |result|
        start_at = self.start_at
        end_at = self.end_at
        result.define_singleton_method(:started?) { Time.zone.now >= start_at }
        result.define_singleton_method(:currently_active?) do
          Time.zone.now >= start_at && Time.zone.now <= end_at
        end
        result.define_singleton_method(:ended?) { Time.zone.now > end_at }
      end
    end

    describe '#time_period_class' do
      subject { helper.time_period_class(stub) }

      context 'when the object is not started' do
        let(:start_at) { Time.zone.now + 1.day }
        let(:end_at) { Time.zone.now + 2.days }
        it { is_expected.to eq(['not-started']) }
      end

      context 'when the object is currently active' do
        let(:start_at) { Time.zone.now - 1.day }
        let(:end_at) { Time.zone.now + 1.day }
        it { is_expected.to eq(['currently-active']) }
      end

      context 'when the object is ended' do
        let(:start_at) { Time.zone.now - 1.week }
        let(:end_at) { Time.zone.now - 1.day }
        it { is_expected.to eq(['ended']) }
      end
    end

    describe '#time_period_message' do
      subject { helper.time_period_message(stub) }

      context 'when the object is not started' do
        let(:start_at) { Time.zone.now + 1.day }
        let(:end_at) { Time.zone.now + 2.days }
        it { is_expected.to eq(I18n.t('common.not_started')) }
      end

      context 'when the object is currently active' do
        let(:start_at) { Time.zone.now - 1.day }
        let(:end_at) { Time.zone.now + 1.day }
        it { is_expected.to be_nil }
      end

      context 'when the object is ended' do
        let(:start_at) { Time.zone.now - 1.week }
        let(:end_at) { Time.zone.now - 1.day }
        it { is_expected.to eq(I18n.t('common.ended')) }
      end
    end
  end

  describe 'draft helper' do
    let(:stub) do
      Object.new.tap do |result|
        draft = self.draft
        result.define_singleton_method(:draft?) { draft }
      end
    end

    describe '#draft_class' do
      subject { helper.draft_class(stub) }
      context 'when the object is a draft' do
        let(:draft) { true }
        it { is_expected.to eq(['draft']) }
      end

      context 'when the object is not a draft' do
        let(:draft) { false }
        it { is_expected.to eq([]) }
      end
    end

    describe '#draft_message' do
      subject { helper.draft_message(stub) }
      context 'when the object is a draft' do
        let(:draft) { true }
        it { is_expected.to eq(I18n.t('common.draft')) }
      end

      context 'when the object is not a draft' do
        let(:draft) { false }
        it { is_expected.to be_nil }
      end
    end
  end

  describe 'unread helper' do
    let(:stub) do
      double.tap do |result|
        me = self
        result.define_singleton_method(:unread?) { |_| !me.read_status }
      end
    end

    describe '#unread_class' do
      subject { helper.unread_class(stub) }
      before { controller.define_singleton_method(:current_user) { nil } }

      context 'when the user has not read the item' do
        let(:read_status) { false }
        it 'returns ["unread"]' do
          expect(subject).to eq(['unread'])
        end
      end

      context 'when the user has read the item' do
        let(:read_status) { true }
        it 'returns an empty array' do
          expect(subject).to eq([])
        end
      end
    end
  end
end
