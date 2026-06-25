const translations: Record<string, Partial<Record<string, string>>> = {
  'Verified': { hi: 'सत्यापित', kn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', ta: 'சரிபார்க்கப்பட்டது', te: 'ధృవీకరించబడింది', mr: 'प्रमाणित', bn: 'যাচাই করা হয়েছে' },
  'ID Checked': { hi: 'आईडी जांची गई', kn: 'ಐಡಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ', ta: 'அடையாளம் சரிபார்க்கப்பட்டது', te: 'ID తనిఖీ చేయబడింది', mr: 'ओळखपत्र तपासले', bn: 'আইডি চেক করা হয়েছে' },
  'Experience': { hi: 'अनुभव', kn: 'ಅನುಭವ', ta: 'அனுபவம்', te: 'అనుభవం', mr: 'अनुभव', bn: 'অভিজ্ঞতা' },
  'years': { hi: 'साल', kn: 'ವರ್ಷಗಳು', ta: 'ஆண்டுகள்', te: 'సంవత్సరాలు', mr: 'वर्षे', bn: 'বছর' },
  'Starting from': { hi: 'शुरू', kn: 'ಪ್ರಾರಂಭ', ta: 'தொடக்கம்', te: 'ప్రారంభం', mr: 'सुरू', bn: 'শুরু' },
  'Book Now': { hi: 'अभी बुक करें', kn: 'ಈಗ ಬುಕ್ ಮಾಡಿ', ta: 'இப்போது முன்பதிவு செய்யவும்', te: 'ఇప్పుడు బుక్ చేయండి', mr: 'आता बुक करा', bn: 'এখনই বুক করুন' },
  'View Profile': { hi: 'प्रोफ़ाइल देखें', kn: 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಿಸಿ', ta: 'சுயவிவரத்தைப் பார்க்க', te: 'ప్రొఫైల్ చూడండి', mr: 'प्रोफाइल पहा', bn: 'প্রোফাইল দেখুন' },
  'Available Now': { hi: 'अभी उपलब्ध', kn: 'ಈಗ ಲಭ್ಯವಿದೆ', ta: 'இப்போது கிடைக்கும்', te: 'ఇప్పుడు అందుబాటులో ఉంది', mr: 'आता उपलब्ध', bn: 'এখন উপলব্ধ' },
  'Featured': { hi: 'फ़ीचर्ड', kn: 'ವೈಶಿಷ್ಟ್ಯಗೊಳಿಸಲಾಗಿದೆ', ta: 'சிறப்பித்துக் காட்டப்பட்டது', te: 'ఫీచర్ చేయబడింది', mr: 'वैशिष्ट्यीकृत', bn: 'ফিচারড' },
  'Sponsored': { hi: 'प्रायोजित', kn: 'ಪ್ರಾಯೋಜಿತ', ta: 'ஸ்பான்சர் செய்யப்பட்டது', te: 'స్పాన్సర్ చేయబడింది', mr: 'प्रायोजित', bn: 'স্পনসরড' },
  'rating': { hi: 'रेटिंग', kn: 'ರೇಟಿಂಗ್', ta: 'மதிப்பீடு', te: 'రేటింగ్', mr: 'रेटिंग', bn: 'রেটিং' },
  'km away': { hi: 'किमी दूर', kn: 'ಕಿಮೀ ದೂರ', ta: 'கிமீ தொலைவில்', te: 'కి.మీ దూరంలో', mr: 'किमी अंतर', bn: 'কি.মি. দূরে' },
  'Cancellation Policy': { hi: 'रद्दीकरण नीति', kn: 'ರದ್ದತಿ ನೀತಿ', ta: 'ரத்துக் கொள்கை', te: 'రద్దు విధానం', mr: 'रद्द करण्याचे धोरण', bn: 'বাতিলকরণ নীতি' },
  'Booking ID': { hi: 'बुकिंग आईडी', kn: 'ಬುಕಿಂಗ್ ID', ta: 'முன்பதிவு ID', te: 'బుకింగ్ ID', mr: 'बुकिंग आयडी', bn: 'বুকিং আইডি' },
  'Total': { hi: 'कुल', kn: 'ಒಟ್ಟು', ta: 'மொத்தம்', te: 'మొత్తం', mr: 'एकूण', bn: 'মোট' },
  'Platform fee': { hi: 'प्लेटफ़ॉर्म शुल्क', kn: 'ಪ್ಲಾಟ್ಫಾರ್ಮ್ ಶುಲ್ಕ', ta: 'தளக் கட்டணம்', te: 'ప్లాట్ఫారమ్ రుసుము', mr: 'प्लॅटफॉर्म फी', bn: 'প্ল্যাটফর্ম ফি' },
  'Professional earns': { hi: 'पेशेवर कमाता है', kn: 'ವೃತ್ತಿಪರ ಗಳಿಕೆ', ta: 'நிபுணர் வருமானம்', te: 'ప్రొఫెషనల్ సంపాదన', mr: 'व्यावसायिक कमाई', bn: 'পেশাদার আয়' },
};

export function translate(key: string, lang: string = 'en'): string {
  if (lang === 'en') return key;
  const entry = translations[key];
  if (!entry) return key;
  return (entry as Record<string, string>)[lang] || key;
}

export function generateVerificationBadge(yearsOfExperience: number, lang: string = 'en'): string {
  const verified = translate('Verified', lang);
  const idChecked = translate('ID Checked', lang);
  const yrs = translate('years', lang);
  const exp = translate('Experience', lang);
  return `${verified} · ${idChecked} · ${yearsOfExperience} ${yrs} ${exp}`;
}
