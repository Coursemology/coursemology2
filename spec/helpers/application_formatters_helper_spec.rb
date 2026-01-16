# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ApplicationFormattersHelper do
  describe 'text helpers' do
    before do
      subject.include(ERB::Util)
    end

    describe '#format_inline_text' do
      it 'does not add a block element' do
        expect(helper.format_inline_text('')).to be_empty
      end
    end

    describe '#format_html' do
      it 'removes script tags' do
        expect(helper.format_html('<script/>')).to be_empty
      end

      it 'does not remove span tags' do
        html = '<span>Hello World!</span>'
        expect(helper.format_html(html)).to eq(html)
      end

      it 'does not remove font tags' do
        html = '<font face="Arial">Hello World!</font>'
        expect(helper.format_html(html)).to eq(html)
      end

      it 'does not remove table styling' do
        html = '<table class="table-bordered"></table>'
        expect(helper.format_html(html)).to eq(html)
      end

      it 'does not remove whitelisted css properties' do
        html = '<div style="margin-left: 20px; font-family: Roboto"></div>'
        expect(helper.format_html(html)).to eq(html)
      end

      it 'removes forbidden css properties' do
        html = '<div style="position: fixed; top: 0; left: 0; height: 20px"></div>'
        output = helper.format_html(html)
        expect(output).not_to include('position')
        expect(output).not_to include('top')
        expect(output).not_to include('left')
        expect(output).not_to include('height')
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

      context 'when img tags are present' do
        it 'removes img tags without src' do
          html = '<img>'
          expect(helper.format_html(html)).to eq('')
        end

        it 'does not remove image src' do
          html = '<img src="hello.jpg">'
          expect(helper.format_html(html)).to eq(html)
        end

        it 'does not remove image height and width' do
          html = '<img src="hello.jpg" style="height: 50%; width: 50%">'
          expect(helper.format_html(html)).to eq(html)
        end

        it 'removes all other css properties on images' do
          html = '<img src="hello.jpg" style="margin-left: 10px; float: left;">'
          output = helper.format_html(html)
          expect(output).not_to include('margin-left')
          expect(output).not_to include('float')
        end

        it 'does not filter out base64 images' do
          html = '<img src="data:image/png;base64,foodata">'
          expect(helper.format_html(html)).to include('data')
        end
      end

      context 'when iframe tags are present' do
        it 'does not remove embedded content from allowed sources' do
          html = <<-HTML
            <iframe src="//youtube.com/video1"></iframe>
          HTML
          expect(helper.format_html(html)).to eq(html)
        end

        it 'removes forbidden embedded content' do
          html = <<-HTML
            <iframe src="//beta.coursemology.org"></iframe>
            <iframe src="//www.youtubeXcom.com"></iframe>
            <iframe src="//wwwXinstagram.com"></iframe>
            <iframe src="//vine.com"></iframe>
            <iframe src="//dailymotion.co"></iframe>
            <iframe src="//vimeo.org"></iframe>
            <iframe src="//instagram.com/video2"></iframe>
            <iframe src="//vimeo.com/video3"></iframe>
            <iframe src="//vine.co/video4"></iframe>
            <iframe src="//dailymotion.com/video5"></iframe>
            <iframe src="//youku.com/video6"></iframe>
          HTML
          expect(helper.format_html(html)).not_to include('iframe')
        end

        it 'removes iframe tags without src attribute' do
          html = '<iframe></iframe>'
          expect(helper.format_html(html)).to be_empty
        end
      end

      context 'when oembed tags are present' do
        it 'transforms embedded content from youtube' do
          html = <<-HTML
            <oembed url="https://www.youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="https://youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="https://m.youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="https://youtu.be/jNQXAC9IVRw"></oembed>
            <oembed url="http://www.youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="http://youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="http://m.youtube.com/watch?v=jNQXAC9IVRw"></oembed>
            <oembed url="http://youtu.be/jNQXAC9IVRw"></oembed>
          HTML

          embed_count = html.scan('<oembed').size
          result = helper.format_html(html)

          expect(result.scan('<iframe').size).to eq(embed_count)
          expect(result.scan('src="https://www.youtube.com/embed/jNQXAC9IVRw').size).to eq(embed_count)
        end

        xit 'transforms embedded content from dailymotion' do
          html = <<-HTML
            <oembed url="https://www.dailymotion.com/video/x3k7o56"></oembed>
            <oembed url="https://dailymotion.com/video/x3k7o56"></oembed>
            <oembed url="https://dai.ly/x3k7o56"></oembed>
            <oembed url="http://www.dailymotion.com/video/x3k7o56"></oembed>
            <oembed url="http://dailymotion.com/video/x3k7o56"></oembed>
            <oembed url="http://dai.ly/x3k7o56"></oembed>
          HTML

          embed_count = html.scan('<oembed').size
          result = helper.format_html(html)

          expect(result.scan('<iframe').size).to eq(embed_count)
          expect(result.scan('src="https://geo.dailymotion.com/player.html?video=x3k7o56').size).to eq(embed_count)
        end

        xit 'transforms embedded content from vimeo' do
          html = <<-HTML
            <oembed url="https://vimeo.com/channels/staffpicks/852794606"></oembed>
            <oembed url="https://vimeo.com/852794606"></oembed>
            <oembed url="https://www.vimeo.com/channels/staffpicks/852794606"></oembed>
            <oembed url="https://www.vimeo.com/852794606"></oembed>
            <oembed url="http://vimeo.com/channels/staffpicks/852794606"></oembed>
            <oembed url="http://vimeo.com/852794606"></oembed>
            <oembed url="http://www.vimeo.com/channels/staffpicks/852794606"></oembed>
            <oembed url="http://www.vimeo.com/852794606"></oembed>
          HTML

          embed_count = html.scan('<oembed').size
          result = helper.format_html(html)

          expect(result.scan('<iframe').size).to eq(embed_count)
          expect(result.scan('src="https://player.vimeo.com/video/852794606').size).to eq(embed_count)
        end

        it 'removes forbidden embedded content' do
          html = <<-HTML
            <oembed url="//beta.coursemology.org"></oembed>
            <oembed url="//www.youtubeXcom.com"></oembed>
            <oembed url="//wwwXinstagram.com"></oembed>
            <oembed url="//vine.com"></oembed>
            <oembed url="//dailymotion.co"></oembed>
            <oembed url="//vimeo.org"></oembed>
          HTML

          expect(helper.format_html(html).squish).to be_empty
        end

        it 'removes oembed tags without url attribute' do
          html = '<oembed></oembed>'
          expect(helper.format_html(html)).to be_empty
        end
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
        expect(helper.sanitize('<script/>')).to be_empty
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
      let(:user) { build_stubbed(:user) }
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
  end

  describe 'draft helper' do
    let(:stub) do
      Object.new.tap do |result|
        published = self.published
        result.define_singleton_method(:published?) { published }
      end
    end
  end

  describe '#clean_html_text' do
    context 'when text is nil' do
      it 'returns empty string' do
        expect(helper.clean_html_text(nil)).to eq('')
      end
    end

    context 'when text is empty' do
      it 'returns empty string' do
        expect(helper.clean_html_text('')).to eq('')
      end
    end

    context 'when text contains HTML tags' do
      it 'strips all HTML tags' do
        html = '<p>Hello <strong>World</strong></p>'
        expect(helper.clean_html_text(html)).to eq('Hello World')
      end

      it 'strips nested HTML tags' do
        html = '<div><p><span>Test</span></p></div>'
        expect(helper.clean_html_text(html)).to eq('Test')
      end
    end

    context 'when text contains HTML entities' do
      it 'decodes &nbsp; to space' do
        html = '<p>Hello&nbsp;World</p>'
        expect(helper.clean_html_text(html)).to eq('Hello World')
      end

      it 'decodes &amp; to &' do
        html = '<p>Test&amp;Example</p>'
        expect(helper.clean_html_text(html)).to eq('Test&Example')
      end

      it 'decodes multiple entities' do
        html = '<p>Hello&nbsp;World&amp;Test&lt;Example&gt;</p>'
        expect(helper.clean_html_text(html)).to eq('Hello World&Test<Example>')
      end

      it 'decodes numeric entities' do
        html = '<p>&#34;Quote&#34;</p>'
        expect(helper.clean_html_text(html)).to eq('"Quote"')
      end
    end

    context 'when text contains paragraph and line breaks' do
      it 'preserves paragraph breaks as newlines' do
        html = '<p>First paragraph</p><p>Second paragraph</p>'
        result = helper.clean_html_text(html)
        expect(result).to eq("First paragraph\nSecond paragraph")
      end

      it 'preserves line breaks as newlines' do
        html = '<p>Line 1<br />Line 2</p>'
        result = helper.clean_html_text(html)
        expect(result).to eq("Line 1\nLine 2")
      end

      it 'handles complex HTML with mixed content' do
        html = '<p>First</p><p>Second<br />Third</p><p>Fourth</p>'
        result = helper.clean_html_text(html)
        expect(result).to eq("First\nSecond\nThird\nFourth")
      end
    end

    context 'edge cases' do
      it 'handles malformed HTML gracefully' do
        html = '<p>Unclosed paragraph'
        result = helper.clean_html_text(html)
        expect(result).to eq('Unclosed paragraph')
      end

      it 'handles text without any HTML' do
        text = 'Plain text'
        result = helper.clean_html_text(text)
        expect(result).to eq('Plain text')
      end

      it 'handles mixed plain text and HTML' do
        html = 'Plain <strong>bold</strong> text'
        result = helper.clean_html_text(html)
        expect(result).to eq('Plain bold text')
      end

      it 'handles script tags (should be stripped)' do
        html = '<p>Safe text</p><script>alert("xss")</script>'
        result = helper.clean_html_text(html)
        expect(result).to eq("Safe text\nalert(\"xss\")")
      end

      it 'handles literal & character' do
        html = 'Peanut Butter & Jelly'
        result = helper.clean_html_text(html)
        expect(result).to eq('Peanut Butter & Jelly')
      end
    end
  end
end
