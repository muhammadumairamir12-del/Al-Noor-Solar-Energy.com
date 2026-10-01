const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Replace the long Facebook logo URL with logo.png
const longFbUrl = 'https://scontent.flhe2-4.fna.fbcdn.net/v/t39.30808-6/295888334_117388544374333_406723974692594063_n.jpg\\?_nc_cat=102&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeGxTlZUacSYXgWQc_8mSypkPMkvrfF97J48yS-t8X3snjh5qf3fQrAmwQ-iQCd6pND-4eahxWcgBTirKIPl584G&_nc_ohc=ntVYoNg8IaYQ7kNvwEjsKGa&_nc_oc=AdrKNqMcUvyHu1P8gNEYXLnIeWuhhq7AW3l5p8H0HTkzrTnK2F7eocp_DkNFLfL3-swbD-8sxeton0GY8qeJ2cpK&_nc_zt=23&_nc_ht=scontent.flhe2-4.fna&_nc_gid=swffIdQ_SX4yAIv7GLW47w&_nc_ss=7a3a8&oh=00_Af2SJv-7K38O985mB4WP30mygfvhmik2Z5ggz681K4cB7g&oe=69D637A2';
const fbRegex = new RegExp(longFbUrl, 'g');
content = content.replace(fbRegex, 'logo.png');

// 2. Also replace the other Facebook URL that might be present for OpenGraph
const otherFbUrl = 'https://scontent.flhe5-1.fna.fbcdn.net/v/t39.30808-6/295888334_117388544374333_406723974692594063_n.jpg\\?_nc_cat=102&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=SvzWicAWYI4Q7kNvwGtcOpF&_nc_oc=AdpZEPiv8nRxxH2oJgH1Q7GFGBpgMok8H9qNlx9cfP0HzuUVjHyvNaoF3dt5mDy1Ob9TJK8R2twNfEr-QJ5yxX_x&_nc_zt=23&_nc_ht=scontent.flhe5-1.fna&_nc_gid=XPpBnbuAIlBPt_zumLFPJw&oh=00_Af0xuQJhRMzkulsuBxp3XqxoDzXfGFWmHUhFqlkJoQTilw&oe=69F13E62';
content = content.replace(new RegExp(otherFbUrl, 'g'), 'logo.png');

// 3. Replace herosection.jpeg with herosection.png
content = content.replace(/herosection\.jpeg/g, 'herosection.png');
content = content.replace(/herosection\.jpg/g, 'herosection.png'); // Just in case

// 4. Ensure brand name is consistent
// Replace "AL Noor Solar" or "Al-Noor Solar" where appropriate, though the user said "Change the brand name to "Al Noor Solar Energy" everywhere."
content = content.replace(/AL Noor Solar(?! Energy)/g, 'Al Noor Solar Energy');
content = content.replace(/Al-Noor Solar Energy/g, 'Al Noor Solar Energy');
content = content.replace(/Al-Noor Solar/g, 'Al Noor Solar Energy');

fs.writeFileSync('index.html', content);
console.log('Update finished.');
