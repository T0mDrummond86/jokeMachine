export default function handler(req, res) {
  const comedians = [
    { value: 'jerry-seinfeld', label: 'Jerry Seinfeld' },
    { value: 'jimmy-carr', label: 'Jimmy Carr' },
    { value: 'mitch-hedberg', label: 'Mitch Hedberg' },
    { value: 'eddie-izzard', label: 'Eddie Izzard' },
    { value: 'steven-wright', label: 'Steven Wright' },
    { value: 'ricky-gervais', label: 'Ricky Gervais' },
    { value: 'dave-chappelle', label: 'Dave Chappelle' },
    { value: 'george-carlin', label: 'George Carlin' },
    { value: 'bill-burr', label: 'Bill Burr' },
    { value: 'chris-rock', label: 'Chris Rock' }
  ];
  res.status(200).json(comedians);
} 