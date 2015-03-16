[:a, :b].find { |_| true }
[:a, :b].detect { |_| true }

puts "SUP!"
puts 'SUP!'

(1..20).reduce(&:+)
(1..20).inject(&:+)
