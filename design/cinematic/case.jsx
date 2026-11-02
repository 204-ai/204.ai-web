/* ============================================================
   SINGLE CASE PAGE — content side · v2
   ============================================================ */

const { useState: useStateC } = React;

/* per-project detail: long text, collaborator credit, gallery */
const CASE_DETAIL = {
  remember: {
    text: "Music video created for the song Remember The Heart by Fine. Augmented with a video synthesiser on an analogue television.",
    collabLabel: 'Resident artist',
    collab: 'Jas Black',
    gallery: ['assets/rem-1.png','assets/rem-2.png','assets/rem-3.png','assets/rem-4.png','assets/rem-5.png','assets/rem-6.png','assets/rem-7.png','assets/rem-8.png','assets/rem-9.png','assets/rem-10.png','assets/rem-11.png'],
    date: '2024',
    products: 'Animation \u00b7 short film',
  },
  clarissa: {
    date: '2026',
    products: 'Animation \u00b7 narrative series',
    paras: [
      "204 was brought in to bring Clarissa back \u2014 the whip-smart, fourth-wall-breaking star of Nickelodeon's Clarissa Explains It All (1991\u20131994) \u2014 and finally give her the format she was built for. The original show's whole gimmick was Clarissa turning to the camera to explain her life straight to the audience; three decades later, we gave her an app to do exactly that, now as a two-way conversation instead of a monologue.",
      "Talk to Clarissa and she explains her world in her own voice \u2014 the mismatched outfits, the bedroom, her running rivalry with her little brother Ferguson, all intact. Visitors can chat with her, dig into her history, and play through games and mysteries built around her universe. She's still working out the kinks \u2014 this is presented as her own personal project, in progress, imperfect on purpose.",
    ],
    collabLabel: 'In collaboration with',
    collab: 'Mitchell Kriegman',
    gallery: ['assets/cla-01.png','assets/cla-02.png','assets/cla-03.png','assets/cla-04.png','assets/cla-05.png'],
  },
  showerthoughts: {
    gallery: ['assets/st-1.png','assets/st-2.png','assets/st-3.png','assets/st-4.png','assets/st-5.png','assets/st-6.png','assets/st-7.png','assets/st-8.png'],
    date: '2024',
    products: 'Animation \u00b7 short film',
    text: "Shower Thoughts is a short film by our resident artist Jas Black.",
    collabLabel: 'Resident artist',
    collab: 'Jas Black',
  },
  sensoria: {
    gallery: ['assets/sen-1.png','assets/sen-2.png','assets/sen-3.png','assets/sen-4.png'],
    date: '2025',
    place: 'Northern Portugal',
    products: 'Festival build \u00b7 Magic Mirror \u00b7 live visuals',
    paras: [
      "We traveled to the north of Portugal to help build a week-long festival for SensorIA, partnering with them to create daily installations and immersive experiences for their guests. Each day introduced a new performance or visual environment, designed to elevate the atmosphere and deepen audience engagement.",
      "One of the standout moments was Reggie Watts's special performance night, where we created a live-reactive visual backdrop. Using our Magic Mirror system, we mixed real-time video input of Reggie into evolving, AI-driven visuals that shifted with the energy of his set.",
      "Another memorable evening featured our music puppets installation for Maz's performance: Dimi controlled the visual content while Val directed the movement, and throughout the show guests stepped into the Lucid Puppets booth to manipulate the visuals themselves \u2014 creating a collaborative, ever-changing performance space.",
    ],
    collabLabel: 'Featured performance',
    collab: 'Reggie Watts',
  },
  oddsgate: {
    gallery: ['assets/odd-1.jpg','assets/odd-2.jpg','assets/odd-3.jpg','assets/odd-4.jpg'],
    date: '2024',
    products: 'Custom content \u00b7 neurofeedback installation',
    text: "With four emotions and eight possible futures, each journey was shaped by neurofeedback. In this interactive experience, visitors traveled to the year 2050, where their emotional state during peak focus determined the path ahead.",
  },
  alanwatts: {
    gallery: ['assets/aw-01.png','assets/aw-02.png','assets/aw-03.png'],
    products: 'Archival restoration \u00b7 AI video',
    paras: [
      "In an age where information accelerates beyond comprehension, archives risk becoming static relics \u2014 a museum of ideas frozen in time. But what if archives could breathe?",
      "Restoring archival video and audio from philosopher Alan Watts into a contemporary visual context, in collaboration with the Alan Watts Foundation.",
    ],
    collabLabel: 'In collaboration with',
    collab: 'Alan Watts Foundation',
  },
  kbc: {
    date: '2025',
    place: "KBC Innovation Centre",
    products: 'Magic Mirror \u00b7 Magic Photo Booth',
    text: "Deployed at KBC's innovation centre. Employees were transformed into custom portraits and walked away with branded prints of their alternative selves. Alongside it, a gaming mirror let people surf and choose the path to innovation by leaning left and right, transforming with the Magic Mirror as they went.",
  },
  zeb: {
    date: '2025 \u2014 ongoing',
    products: 'Virtual outfitting \u00b7 monthly retainer',
    paras: [
      "An ongoing monthly retainer producing fashion shoots for Zeb's Shop the Look campaigns: 32 looks a month. Given a moodboard for lighting and vibe, plus the models and styled outfits, we generate photoshoots that match their mood for that month. Real clothing, generative photoshoot.",
      "Consistent style across every output, with models, poses and shots approved by Zeb along the way, and every styled outfit generated true to its detail.",
    ],
    gallery: ['assets/zeb-01.jpg','assets/zeb-02.jpg','assets/zeb-03.jpg','assets/zeb-04.jpg','assets/zeb-05.jpg','assets/zeb-06.jpg','assets/zeb-07.jpg','assets/zeb-08.jpg','assets/zeb-09.png','assets/zeb-10.png','assets/zeb-11.png','assets/zeb-12.png','assets/zeb-13.png','assets/zeb-14.jpg'],
  },
  nfc: {
    date: '2026',
    place: 'Unicorn Factory, Lisbon',
    products: 'Immersive environment \u00b7 AI installations \u00b7 VR preview',
    paras: [
      "MOODSCAPE was an immersive digital art environment by RnA Studio for NFC Summit 2026. We took over the basement of Unicorn Factory and turned it into a sensory world where AI, digital art, sound, architecture, and human interaction come together \u2014 a space to step away from the conference and into something else entirely.",
      "Visitors didn't just view the work, they moved through it. Interactive AI installations, generative artworks, audiovisual experiences, and community showcases from invited artists and collectives, alongside a preview of Trail of Angels, featuring the work of M. K. \u010ciurlionis.",
    ],
    gallery: ['assets/nfc-01.jpg','assets/nfc-02.jpg','assets/nfc-03.jpg','assets/nfc-04.jpg','assets/nfc-05.jpg','assets/nfc-06.jpg','assets/nfc-07.jpg','assets/nfc-08.jpg','assets/nfc-09.jpg','assets/nfc-10.jpg','assets/nfc-11.jpg','assets/nfc-12.jpg','assets/nfc-13.jpg','assets/nfc-14.jpg'],
  },
  vibra: {
    date: '2024',
    place: 'Lisbon, Portugal',
    products: 'Magic Mirror \u00b7 augmented art',
    text: "At Vibra, we reimagined the Magic Mirror as an immersive entryway into an old warehouse filled with art and sound. A thin layer of tulle fabric was suspended in the space, creating a semi-transparent screen. As people passed through, their movements triggered AI-generated reflections that appeared on and behind the fabric \u2014 ghostlike, shifting, alive. The layered mesh allowed multiple reflections to overlap, creating a dreamlike atmosphere. Set against the raw textures of the building, the installation transformed the entrance into a living portal, blurring the line between arrival and transformation.",
    gallery: ['assets/vib-01.jpg','assets/vib-02.jpg','assets/vib-03.jpg','assets/vib-04.jpg','assets/vib-05.jpg','assets/vib-06.jpg','assets/vib-07.jpg','assets/vib-08.jpg','assets/vib-09.jpg','assets/vib-10.jpg','assets/vib-11.jpg'],
  },
  breastcancer: {
    date: '2024',
    products: 'Animation \u00b7 awareness film',
    gallery: ['assets/bc-01.png','assets/bc-02.png','assets/bc-03.png','assets/bc-04.png','assets/bc-05.png','assets/bc-06.png'],
    text: "We set out to raise awareness for breast cancer through a visual journey of strength, metamorphosis, and embodied resilience. Inspired by a heartfelt poem written by our team member Cecilia, we crafted delicate, symbolic visuals that bring her words to life. Each scene was designed to honour the courage of those affected by breast cancer while creating a gentle, transformative atmosphere that amplifies the poem's message. Together, the imagery and poetry form a short but powerful tribute meant to inspire reflection, support, and hope.",
  },
  bioxyz: {
    gallery: ['assets/bio-1.png','assets/bio-2.png','assets/bio-3.png','assets/bio-4.png','assets/bio-5.png','assets/bio-6.png'],
    date: '2024',
    products: 'Branded campaign \u00b7 token launch',
    text: "Starting from the brand's own character drawings, we brought them to life through custom animations that stayed true to BioXYZ's identity. The result was a promotional video for their new coin that translated abstract ideas into a vivid story, aligned naturally with BioXYZ's identity.",
  },
  venom: {
    gallery: ['assets/ven-1.png','assets/ven-2.png','assets/ven-3.png','assets/ven-4.png','assets/ven-5.png','assets/ven-6.png'],
    date: '2024',
    products: 'Branded campaign \u00b7 identity film',
    text: "We developed a full concept for a hypothetical perfume brand, crafting an identity film entirely from scratch \u2014 complete with narrative, visual language, and sound design. This piece explores themes of transformation, seduction, and embodied desire, using evocative imagery and atmosphere to bring the brand's essence to life.",
  },
  surrender: {
    date: '2025',
    place: 'Natural History Museum, Lisbon',
    products: 'Interactive installation \u00b7 live performance \u00b7 short film',
    gallery: ['assets/stn-01.jpg','assets/stn-02.jpg','assets/stn-03.jpg','assets/stn-04.jpg','assets/stn-05.jpg','assets/stn-06.jpg','assets/stn-07.jpg'],
    paras: [
      "In collaboration with Barbara Viega we created a custom short film blending AI and real footage that explored the four elements, offering a new perspective on Barbara's journey through nature. Using a variety of AI film creation techniques \u2014 including training a video model on Barbara \u2014 we crafted a narrative that bridged her body and the natural world through technology.",
      "As part of the exhibition opening, 204 presented a site-specific version of the Magic Mirror, trained on the same nature-inspired visuals featured in the video installation. During the live performance, Barbara danced in front of the mirror, her reflection transforming in real time into natural elements: ocean waves, wind textures, forest and fire.",
      "After the performance, guests were invited to step into the mirror themselves \u2014 experiencing the transformation firsthand. Each participant became part of the environment, embodying the exhibition's central theme: surrendering to nature.",
    ],
    collabLabel: 'Artist collaboration',
    collab: 'Barbara Viega',
  },
  talentinlimbo: {
    gallery: ['assets/til-1.png','assets/til-2.png','assets/til-3.png','assets/til-4.png','assets/til-5.png','assets/til-6.png'],
    date: '2025',
    products: 'Animation \u00b7 narrative short',
    text: "A surreal afterlife talent show where the dead return for one final performance. Hosted by Adolf Hitler and judged by Jesus, Satan, Amy Winehouse, and Simon Cowell Bot, the show decides who will pass through the Golden Gates of Heaven, who will burn through Hell's Door, and who must face the mysterious unknown.",
    collabLabel: 'Resident artist',
    collab: 'Jas Black',
  },
  popularfaces: {
    gallery: ['assets/pf-1.png','assets/pf-2.png','assets/pf-3.png','assets/pf-4.png','assets/pf-5.png','assets/pf-6.png','assets/pf-7.png','assets/pf-8.png','assets/pf-9.png','assets/pf-10.png'],
    date: '2024',
    products: 'Animation \u00b7 music video',
    text: "Popular Faces is track three of Egotoxin, the thirteen-track, story-heavy album by Boss Moxi. The album is a fusion of rock, opera, spoken word and experimental jazz based in Yugen City \u2014 the fictional world in which the band reside. This world is further explored in the hand-drawn, 118-page graphic novel of the same name, which was born as a result of the music.",
    collabLabel: 'Resident artist',
    collab: 'Jas Black',
  },
  motelx: {
    date: 'July 2026',
    place: 'Portugal',
    products: 'Magic Photo Booth \u00b7 custom frame design',
    paras: [
      "MotelX handed us their brand and theme: HORROR. We crafted custom prompts to bring the festival's identity into a custom memory guests could take home.",
      "The result, in just 45 minutes: over 140 photos taken and saved digitally, and more than 60 printed on the spot.",
    ],
    gallery: ['assets/mx-01.jpg','assets/mx-02.jpg','assets/mx-03.jpg','assets/mx-04.jpg','assets/mx-05.jpg','assets/mx-06.jpg','assets/mx-07.jpg','assets/mx-08.jpg','assets/mx-09.jpg','assets/mx-10.jpg','assets/mx-11.jpg'],
  },
  rubr: {
    date: '2025',
    products: 'Branded campaign \u00b7 brand identity \u00b7 packaging',
    text: "In an effort to showcase our creative thinking and advertising skills, we designed a hypothetical condom brand \u2014 brand book, condom wrappers and boxes, plus a campaign with posters and videos to market them. AI helped create the campaign videos and product images, but our designer built the entire brand. Using well-known buildings and finding subtle but clear ways of showcasing how one should use protection, we designed a marketing campaign and three example executions to advertise the product.",
    gallery: ['assets/rub-01.png','assets/rub-02.png','assets/rub-03.png','assets/rub-04.png','assets/rub-05.png','assets/rub-06.png'],
  },
  thorneshade: {
    date: '2025',
    products: 'Branded campaign \u00b7 short-form film',
    gallery: ['assets/thn-01.png','assets/thn-02.png','assets/thn-03.png','assets/thn-04.png','assets/thn-05.jpg','assets/thn-06.png'],
    text: "We created a short ad for a hypothetical sunglasses brand called \u201cThorneshade,\u201d inspired by the energy of raving and the organic beauty of a rose bush. By blending stylized storytelling with captivating, experimental visuals, we set out to pull the viewer into a vibrant world before transitioning into more classic product-driven imagery. The result is a short, film-like ad that not only showcases the allure of Thorneshade but also highlights our creative range and production skills.",
  },
  yard: {
    date: '06.07.2024',
    place: 'Portugal',
    products: 'Live visuals \u00b7 architectural mapping',
    text: "Live visuals and mapping for Yard's Episode X Scenarios, projected across the building itself. We drew from nature and Portuguese azulejos, building visuals that blended into the architecture rather than sitting on top of it, turning the surface into atmosphere for the DJ to play in and the crowd to move to.",
    gallery: ['assets/yxs-01.jpg','assets/yxs-02.jpg','assets/yxs-03.jpg','assets/yxs-04.jpg','assets/yxs-05.jpg','assets/yxs-06.jpg'],
  },
  wines: {
    date: '31.10.2023',
    place: 'Portugal',
    products: 'Augmented art \u00b7 interactive installation',
    paras: [
      "At \u2018Wine From Another World\u2019 we infused traditional elements with avant-garde technology, enriching cultural and sensory experiences. The event blended centurial architecture with cutting-edge digital artistry.",
      "We teamed up with MuLabs to create two interactive installations for the launch of the new wine of Wines From Another World \u2014 elevating the wine-tasting experience through innovative technology and compelling narrative.",
    ],
    collabLabel: 'Technical collaboration',
    collab: 'MuLabs',
    gallery: ['assets/win-01.jpg','assets/win-02.jpg','assets/win-03.jpg','assets/win-04.jpg','assets/win-05.jpg','assets/win-06.jpg','assets/win-07.jpg'],
  },
  yardep: {
    date: '24.05.2024',
    place: 'Portugal',
    products: 'Projection mapping \u00b7 live visuals',
    text: "Dive into Yard Episodes, where we transformed Portugal's cliffs with stunning visuals again. This beach party was elevated by our advanced projection mapping, creating a captivating backdrop of lights and colours. Experience the seamless blend of nature and technology that made this event truly stand out. The theme? Jungle, Tulum vibes \u2014 to create the perfect beach feel.",
    gallery: ['assets/yrd-01.jpg','assets/yrd-02.jpg','assets/yrd-03.jpg','assets/yrd-04.jpg','assets/yrd-05.jpg','assets/yrd-06.jpg','assets/yrd-07.jpg','assets/yrd-08.jpg','assets/yrd-09.jpg','assets/yrd-10.jpg','assets/yrd-11.jpg'],
  },
  eclipse: {
    date: '05\u201309.04.2023',
    place: 'Texas, USA',
    products: 'Dome projection \u00b7 live visuals',
    text: "Eclipses, festivals, big domes, visuals and sound \u2014 name a better combination. At Texas Eclipse festival, together with artist Android Jones, we projected large-scale visuals in the impressive dome, allowing viewers to be fully immersed in the visual journey.",
    collabLabel: 'Artist collaboration',
    collab: 'Android Jones',
    gallery: ['assets/tx-01.jpg','assets/tx-02.jpg','assets/tx-03.jpg','assets/tx-04.jpg','assets/tx-05.jpg','assets/tx-06.jpg','assets/tx-07.jpg','assets/tx-08.jpg','assets/tx-09.jpg'],
  },
  studio54b: {
    date: '24.05.2024',
    place: 'Portugal',
    products: 'Magic Mirror \u00b7 live visuals',
    text: "We shared a special night of creativity: musicians, dancers, live painters, and AI art all coming together. It was one of those moments where art and people naturally connect, creating something beautiful.",
    gallery: ['assets/s54-01.jpg','assets/s54-02.jpg','assets/s54-03.jpg','assets/s54-04.jpg','assets/s54-05.jpg','assets/s54-06.jpg'],
  },
  hulaween: {
    date: '24\u201327.10.2024',
    place: 'Florida, USA',
    products: 'Magic Mirror \u2014 Spirit Mirror',
    text: "Halloween got a whole lot spookier when we got involved. In Florida's famous Hulaween there's a lake named \u201cSpirit Lake\u201d known for being haunted \u2014 no one really knows what lives inside. This inspired us to create the Spirit Mirror, where participants can be transformed into the spirits we imagine live within it.",
    gallery: ['assets/hul-01.jpg','assets/hul-02.jpg','assets/hul-03.jpg','assets/hul-04.jpg'],
  },
  lisboninsiders: {
    date: '31.10.2023',
    place: 'Portugal',
    products: 'Stage visuals \u00b7 mapping \u00b7 live performance',
    paras: [
      "For the Lisbon Insiders Awards, we led the full creative production for the event's visual content. This included the design and animation of the on-stage visuals used throughout the ceremony \u2014 from category intros to winner announcements.",
      "The second part of the night featured a live performance by 204 team member Sofie Heymans, who also created the visuals for her own piece. She collaborated with MuLabs to integrate real-time effects and an avatar system using a Kinect sensor, allowing her movements to generate and manipulate visuals live during the performance. In addition, we handled the full stage and screen build for the event, delivering a complete visual and spatial experience.",
    ],
    collabLabel: 'In collaboration with',
    collab: 'MuLabs',
    gallery: ['assets/li-01.jpg','assets/li-02.jpg','assets/li-03.jpg','assets/li-04.jpg','assets/li-05.jpg','assets/li-06.jpg','assets/li-07.jpg','assets/li-08.jpg','assets/li-09.jpg','assets/li-10.jpg','assets/li-11.jpg'],
  },
  eegmirror: {
    place: 'London',
    products: 'Magic Mirror \u00b7 neurofeedback (MuLabs)',
    text: "Your mind becomes the exhibit. The Brain Mirror translates your real-time brain activity into evolving visual forms. Powered by 204.ai generative technology and MuLabs neurofeedback, the installation responds to shifts in attention, focus, and mental engagement. As you concentrate, the imagery transforms, turning your internal cognitive state into a living artwork.",
    collabLabel: 'In collaboration with',
    collab: 'MuLabs',
    gallery: ['assets/eeg-01.jpg','assets/eeg-02.jpg','assets/eeg-03.jpg','assets/eeg-04.jpg'],
  },
  standv: {
    gallery: ['assets/sv-f1.png','assets/sv-f2.png','assets/sv-f3.png','assets/sv-f4.png','assets/sv-f5.png','assets/sv-f6.png','assets/sv-f7.png','assets/sv-f8.png','assets/sv-f9.png','assets/sv-p1.jpg','assets/sv-p2.jpg','assets/sv-p3.jpg','assets/sv-p4.jpg','assets/sv-p5.jpg','assets/sv-p6.jpg','assets/sv-p7.jpg'],
    date: '05.02.2026',
    place: 'Portugal',
    products: 'Magic Photo Booth \u00b7 branded campaign film',
    text: "For Stand Virtual's conference, themed \u201cBack to the Future\u201d, we created an action-packed opening film featuring cars from different eras racing through the streets of Lisbon, showcased in front of hundreds of people. Set with two side-screen videos matched and tailored to key events in the main video \u2014 along with a Magic Photo Booth turning you into the future version of yourself, driving.",
    gallery: ['assets/sv-01.jpg','assets/sv-02.jpg','assets/sv-03.jpg','assets/sv-04.jpg','assets/sv-05.jpg','assets/sv-06.jpg','assets/sv-07.jpg','assets/sv-08.jpg','assets/sv-09.jpg','assets/sv-10.jpg','assets/sv-11.jpg','assets/sv-12.png'],
  },
  mazarine: {
    date: '2023',
    place: 'Paris, France',
    products: 'Augmented art \u00b7 projection mapping',
    paras: [
      "Take a classical painting and add an extra edge to bring it to life. Together with Aur\u00e8ce Vettier we added new layers and brought the painting's story to life. With our special techniques and ComfyUI we are able to bring any painting to life.",
      "204.no-content and Aur\u00e8ce Vettier (FR) present \u201ceverything takes place as it did not exist (a transfiguration)\u201d \u2014 a breakthrough piece where the painting serves as the physical vessel for an imaginative mapping projection. A journey evoking an inflection point in one's life, the passage from one world to another, surrounded by an imaginary but reassuring nature, a four-eyed black cat, and formidable atmospheric phenomena.",
    ],
    collabLabel: 'Artist collaboration',
    collab: 'Aur\u00e8ce Vettier',
    gallery: ['assets/maz-01.jpg','assets/maz-02.jpg'],
  },
  vagabond: {
    date: '11.10.2024',
    place: 'Portugal',
    text: "Making memories with plants through our magic touch installation \u2014 allowing you to connect with nature and interact with plant creatures, a puppetry show controlled by you, creating sensual visuals on the ceiling of the venue for all to enjoy. Mixed in with music and performance to create this enticing and ever-changing interactive environment. Be sure to catch the next Vagabond event to be truly blown away.",
    gallery: ['assets/vag-01.jpg','assets/vag-02.jpg','assets/vag-03.jpg','assets/vag-04.jpg','assets/vag-05.jpg','assets/vag-06.jpg','assets/vag-07.jpg','assets/vag-08.jpg','assets/vag-09.jpg'],
  },
  synesthesia: {
    date: '24.05.2024',
    place: 'Portugal',
    text: "Enter the Coven, where the eye is always watching you. We took over a corner of the festival, transforming it into a magical space filled with interactive installations, mesmerizing visuals, and immersive music. Dance with our AI mirror and transform into anything you imagine. Every installation offered something new to experience, blending art, technology, and sound into a journey that engaged all the senses \u2014 as well as our collaboration with other artists, elevating their shows with dance and visuals.",
    gallery: ['assets/syn-01.jpg','assets/syn-02.jpg','assets/syn-03.jpg','assets/syn-04.jpg','assets/syn-05.jpg','assets/syn-06.jpg','assets/syn-07.jpg','assets/syn-08.jpg','assets/syn-09.jpg','assets/syn-10.jpg','assets/syn-11.jpg','assets/syn-12.jpg','assets/syn-13.jpg','assets/syn-14.jpg','assets/syn-15.jpg','assets/syn-16.jpg','assets/syn-17.jpg','assets/syn-18.jpg','assets/syn-19.jpg','assets/syn-20.jpg','assets/syn-21.jpg','assets/syn-22.jpg','assets/syn-23.jpg','assets/syn-24.jpg','assets/syn-25.jpg','assets/syn-26.jpg'],
  },
  rareeffect: {
    date: '31.10.2023',
    place: 'Portugal',
    products: 'Magic Mirror with touch features · Augmented art',
    paras: [
      "Bare to the Earth.",
      "In a dim, enclosed space, nature reclaims its ground. Vibrant vines weave through flickering analog TVs, reflecting fragmented images of yourself \u2014 alien yet deeply human. Touch a VHS tape to uncover memories of an ancient future, transforming the visuals in real-time. Here, obsolescence comes alive \u2014 symbols of the past blend with AI to reveal the quiet strength of nature and the delicate vulnerability of humanity.",
    ],
    gallery: ['assets/rare-01.jpg','assets/rare-02.jpg','assets/rare-03.jpg','assets/rare-04.jpg','assets/rare-05.jpg','assets/rare-06.jpg'],
  },
  techweek: {
    date: '31.10.2023',
    place: 'Portugal',
    text: "At Portugal Tech Week, we presented a series of installations exploring the evolving relationship between human expression and intelligent systems. Our Magic Mirror appeared as a living, responsive sculpture that reinterpreted each viewer's presence through real-time transformation \u2014 shifting from poetic to playful depending on the moment. We exhibited a dual augmented art piece that placed organic creation and AI-generated imagery side by side: one canvas unfolding an artist's gestures as living video, the other revealing an artificial system dreaming in the artist's visual language. Across the space, a dedicated screen showcased our experimental AI content, while an additional AR painting from BURST extended the experience into mixed reality. Together, these works formed a continuum between physical and digital creation, inviting guests to witness how perception, technology, and imagination co-produce new forms of art.",
    gallery: ['assets/ptw-01.jpg','assets/ptw-02.jpg','assets/ptw-03.jpg','assets/ptw-04.jpg','assets/ptw-05.jpg','assets/ptw-06.jpg','assets/ptw-07.jpg','assets/ptw-08.jpg','assets/ptw-09.jpg'],
  },
  tkeshii: {
    date: '2025',
    place: 'Georgia',
    text: "At TKESHII, we hosted workshops, DJ sets by our team member CIN, and a series of immersive visual performances. One of the highlights was a live collaborative piece created for a rock band using our Magic Mirror attachment, Liminal Lens, to generate evolving, real-time augmented visuals. The system responded intuitively to the band's presence, blurring the line between performer and projection. The result was an early example of a hybrid band-and-AI visual performance \u2014 mysterious, reactive, and unlike anything seen on stage before.",
    gallery: ['assets/tke-01.jpg','assets/tke-02.jpg','assets/tke-03.jpg','assets/tke-04.jpg','assets/tke-05.jpg','assets/tke-06.jpg'],
  },
  burst: {
    date: '04.02.2025',
    place: 'Austria',
    text: "For Burst_'s solo exhibition in Linz Museum, we introduced The Burst_ Book as an interactive art piece. Visitors could write their own prompt — anything from \u201cBatman eating a banana\u201d to their wildest imagined scenes — and watch it come to life, generated in Burst_'s signature style. The model was trained entirely on his body of work, so each co-created image felt like an extension of his visual universe. It was a playful, participatory piece that gave audiences a chance to think like the artist and see their ideas interpreted through his lens.",
    gallery: ['assets/burst-01.jpg','assets/burst-02.jpg','assets/burst-03.jpg','assets/burst-04.jpg','assets/burst-05.jpg','assets/burst-06.jpg','assets/burst-07.jpg','assets/burst-08.jpg'],
  },
  delulu: {
    paras: [
      "Within minutes of meeting, Milena had already decided to get Sofie Heyman flying with paint. Luckily, with the help of the talented aerial acrobat Jura Hau, the idea left the ground. Sofie had never worked with aerial silk before. Yet, with Jura's guidance, she found herself suspended in the air, painting while flying. Together, they improvised for the first time — using paint, bodies, movement, silk, and canvas as their medium — exploring gravity and everything in between. Discipline met desire. And then the shoot day arrived.",
      "Behind the scenes, Milena was exploring another tension: digital versus analog — not as enemies, but as collaborators. At a time when technology is often framed as a replacement for handmade art, this project asks something softer: What if it simply supports it? What if real vision, real emotion, and real authorship still belong to the human hand?",
      "Experimenting with broken technology, Milena dismantled a MacBook Pro screen and transformed its inner reflective layers into handmade analog filters — creating a literal \u201cdelulu\u201d lens. Technology re-entered the physical world not as a machine, but as material. The shoot embraced simplicity: studio lamps, a handmade reflector, intuition. Petra behind the camera. Raquel shaping the light. Giovanni capturing the backstage pulse. Jura guiding the body in air. Milena as creative director and camerawoman, building the team that made flight possible.",
      "Delulu is not just illusion. It is trust. It is chaos organized by vision. It is teamwork turning an idea into gravity-defying reality. Somewhere between dream and discipline, digital and dust, falling and flying — we found it. And that click is real.",
    ],
    creditsLabel: 'Artists involved',
    credits: [
      ['Milena Kravetz', 'Creative Director', '@Milena_Kravetz'],
      ['Sofie Heyman', 'Dancer & Artist', '@sofie_heyman'],
      ['Jura Hau', 'Aerial Acrobat', '@Jurahau'],
      ['Petra Fogl', 'Photographer', '@fres_lil_pfoto'],
      ['Geovanny \u201cGizmuu\u201d', 'Videographer', '@giz.muu'],
      ['Raquel Pedroto', 'Assistant', '@Kellyprxasamigxs'],
    ],
    gallery: ['assets/del-01.jpg','assets/del-02.jpg','assets/del-03.jpg','assets/del-04.jpg','assets/del-05.jpg','assets/del-06.jpg','assets/del-07.jpg','assets/del-08.jpg','assets/del-09.jpg','assets/del-13.jpg','assets/del-10.jpg','assets/del-11.jpg','assets/del-12.jpg'],
  },
  ciurlionis: {
    text: "Dream Worlds is a surreal narrative exploration through the subconscious universe of Lithuania's legendary painter and composer, Mikalojus Konstantinas Čiurlionis. Immersed directly within his iconic Symbolist canvases, the artist wanders across vibrant hills, celestial stairways, radiant sunrises, and primordial beasts, moving endlessly through a landscape woven from dream, myth, and imagination.",
    collabLabel: 'Artist collaboration',
    collab: 'Jas Black',
    gallery: ['assets/ciur-01.png','assets/ciur-02.png','assets/ciur-03.png','assets/ciur-04.png','assets/ciur-05.png','assets/ciur-06.png','assets/ciur-07.png','assets/ciur-08.png','assets/ciur-09.png','assets/ciur-10.png','assets/ciur-11.png'],
  },
};

function CaseGallery({ srcs }) {
  const rest = srcs;
  const [ratios, setRatios] = React.useState({});
  React.useEffect(() => {
    let live = true;
    rest.forEach(src => {
      const im = new Image();
      im.onload = () => { if (live) setRatios(r => ({ ...r, [src]: im.naturalHeight / im.naturalWidth })); };
      im.src = src;
    });
    return () => { live = false; };
  }, [srcs.join('|')]);
  const nCols = Math.max(1, Math.min(3, rest.length));
  const cols = Array.from({ length: nCols }, () => []);
  const h = new Array(nCols).fill(0);
  // pack tallest-first (LPT) so a late portrait can't blow out one column
  const order = rest.map((src, i) => ({ src, i, r: (ratios[src] || 0.66) + 0.02 }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  order.forEach(({ src, r }) => {
    const i = h.indexOf(Math.min(...h));
    cols[i].push(src);
    h[i] += r;
  });
  cols.forEach(col => col.sort((a, b) => rest.indexOf(a) - rest.indexOf(b)));
  return (
    <section className="case-gallery">
      <div className="cols" style={{gridTemplateColumns:`repeat(${nCols},1fr)`}}>
        {cols.map((col, i) => (
          <div key={i} className="col">
            {col.map(src => <img key={src} className="g" src={src} alt="" loading="lazy" />)}
          </div>
        ))}
      </div>
    </section>
  );
}

const CLIENT_LOGOS = {
  hulaween:'assets/logo-hula.png',
  eclipse:'assets/logo-eclipse.avif',
  tkeshii:'assets/logo-tkeshii.png',
  alanwatts:'assets/logo-alanwatts.png',
  vagabond:'assets/logo-vagabond.png',
  rareeffect:'assets/logo-rareeffect.png',
  studio54b:'assets/logo-studio54b.png',
  lisboninsiders:'assets/logo-lisbon.png',
  techweek:'assets/logo-techweek.png',
  nfc:'assets/logo-nfc.png',
  wines:'assets/logo-wines.png',
  yard:'assets/logo-yard.png',
  yardep:'assets/logo-yard.png',
  bioxyz:'assets/logo-bioxyz.png',
  mazarine:'assets/logo-obscura.png',
  motelx:'assets/logo-motelx.png',
  oddsgate:'assets/logo-oddsgate.png',
  standv:'assets/logo-standv-w.png',
  synesthesia:'assets/logo-synesthesia.png',
  surrender:'assets/logo-barbara.png',
};

function CasePage({ onNav, workId = 'rubr' }) {
  const [lightboxReel, setLightboxReel] = useStateC(null);

  const work = (window.WORKS && window.WORKS.find(w => w.id === workId)) || { id:'rubr', title:'Rubr', kind:'Branded', year:'2026', desc:'Condom ad campaign', bg:'linear-gradient(135deg,#5a1f2a 0%,#1a0608 60%,#0a0408)' };
  const detail = CASE_DETAIL[workId] || null;
  const fullReel = { id:work.id, title:work.title, kind:work.kind, year:work.year, runtime:'2:14', yt:work.yt, bg:work.bg };

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightboxReel(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="page-fade">
      <section className="case-hero" onClick={work.yt ? () => setLightboxReel(fullReel) : undefined} style={work.yt ? {cursor:'pointer'} : null}>
        <div className="bg" style={work.img ? {backgroundImage:`url(${work.img})`,backgroundSize:'cover',backgroundPosition:work.pos||'center'} : {background:work.bg}}></div>
        {work.clip && !window.__OFFLINE_BUILD && <video className="bg-clip" src={work.clip} autoPlay muted loop playsInline preload="auto"></video>}
        <div className="scrim"></div>
        <div className="meta-tl">{work.year} &nbsp;·&nbsp; {work.kind}{work.yt && <> &nbsp;·&nbsp; click to play with sound</>}</div>
        <div className="meta-tr">// {work.desc}</div>
        {work.yt && <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
          <span style={{width:96,height:96,borderRadius:'50%',border:'1px solid var(--paper)',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',backdropFilter:'blur(6px)',color:'var(--paper)'}}>
            <svg viewBox="0 0 24 24" width="28" height="28" style={{fill:'currentColor',marginLeft:4}}><path d="M8 5v14l11-7z"/></svg>
          </span>
        </div>}
        <div className="title">{work.title}</div>
      </section>

      {/* META + TOGGLE */}
      <section className="case-meta">
        <div className="left">
          <div className="row">
            <span className="lab">Client</span>
            <span className="val">
              {CLIENT_LOGOS[work.id] && <img className="client-logo" src={CLIENT_LOGOS[work.id]} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />}
              {work.title}
            </span>
          </div>
          <div className="row">
            <span className="lab">Format</span>
            <span className="val">{work.kind}{!(detail && detail.date) && <> · {work.year}</>}</span>
          </div>
          <div className="row">
            <span className="lab">Direction</span>
            <span className="val">204.studio</span>
          </div>
          <div className="row">
            <span className="lab">{detail && detail.products ? 'Products used' : 'Tools'}</span>
            <span className="val">{detail && detail.products ? detail.products : <>AI generation · live capture<br/>color · grade</>}</span>
          </div>
          {detail && detail.date && (
            <div className="row">
              <span className="lab">Date</span>
              <span className="val">{detail.date}</span>
            </div>
          )}
          {detail && detail.place && (
            <div className="row">
              <span className="lab">Place</span>
              <span className="val">{detail.place}</span>
            </div>
          )}
        </div>
        <div className="body">
          {detail ? (
            <>
              {detail.text && <p>{detail.text}</p>}
              {detail.paras && detail.paras.map((t, i) => <p key={i} style={i ? {marginTop:22} : null}>{t}</p>)}
              {detail.credits && (
                <div className="credit-list">
                  <div className="lab">{detail.creditsLabel || 'Artists involved'}</div>
                  {detail.credits.map(([name, role, handle]) => (
                    <div key={name} className="crow">
                      <span className="n">{name}</span>
                      <span className="r">{role}</span>
                      <span className="h">{handle}</span>
                    </div>
                  ))}
                </div>
              )}
              {detail.collab && (
                <div className="collab">
                  <span className="lab">{detail.collabLabel || 'Artist collaboration'}</span>
                  <span className="who">{detail.collab}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <p>
                {work.desc}. Built by <b>204.studio</b> — human direction, AI-amplified production, graded and cut like cinema.
              </p>
              <p style={{marginTop:24}}>
                <b>Tight crops, hard contrast, no apologies.</b> The work plays as a full film and as social cut-downs — same world, multiple formats.
              </p>
            </>
          )}
        </div>
      </section>

      <TitleCard
        chapter="01. // chapter"
        name="The frames"
        tail={'tight crops\nhard contrast'}
      />

      {detail && detail.gallery ? (
        <CaseGallery srcs={detail.gallery} />
      ) : (
        <>
          <section className="case-strip">
            <div className="frame" style={{background:'linear-gradient(135deg,#5a1f2a,#1a0608)'}}></div>
            <div className="frame" style={{background:'linear-gradient(45deg,#2a0a1a,#0a0408)'}}></div>
            <div className="frame" style={{background:'linear-gradient(135deg,#3a0a14,#0a0408)'}}></div>
          </section>
          <section className="case-strip wide-row" style={{paddingTop:0}}>
            <div className="frame" style={{background:'linear-gradient(90deg,#0a0408,#5a1f2a 50%,#0a0408)'}}></div>
          </section>
        </>
      )}

      <TitleCard
        chapter="03. // chapter"
        name="Up next"
        tail={'continue the reel\nor skip back'}
      />

      <section className="section" style={{padding:'40px var(--side-pad) 120px'}}>
        <div className="cinegrid">
          {(() => {
            const all = window.WORKS || [];
            const i = Math.max(0, all.findIndex(w => w.id === workId));
            return [all[(i + 1) % all.length], all[(i + 2) % all.length]]
              .filter(Boolean)
              .map(w => (
                <CineCard
                  key={w.id}
                  title={w.title}
                  metaTl={w.year + ' · ' + w.kind.toLowerCase()}
                  metaTr="dir. 204"
                  sub={w.desc}
                  img={w.img}
                  bg={w.bg}
                  onClick={() => onNav('case', { work: w.id })}
                />
              ));
          })()}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <Pill onClick={() => onNav('portfolio')}>Back to all work</Pill>
        </div>
      </section>

      <ChatCloser onNav={onNav} />

      <Footer onNav={onNav} />

      {/* Use the VideoLightbox component defined in home.jsx */}
      {lightboxReel && lightboxReel.yt && (
        <div className="lightbox" onClick={() => setLightboxReel(null)}>
          <div className="frame" onClick={e => e.stopPropagation()}>
            {lightboxReel.yt ? (
              window.__OFFLINE_BUILD ? (
                <a className="lb-media lb-yt-fallback" href={`https://www.youtube.com/watch?v=${lightboxReel.yt}`} target="_blank" rel="noreferrer">
                  <span className="lab">// {lightboxReel.title}</span>
                  <span className="cta">▶ Watch on YouTube ↗</span>
                </a>
              ) : (
              <iframe
                className="lb-media"
                src={`https://www.youtube.com/embed/${lightboxReel.yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={lightboxReel.title}
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              ></iframe>
              )
            ) : (
              <>
                <div className="vid" style={{background:lightboxReel.bg}}></div>
                <div className="scrim"></div>
                <div className="play-big">
                  <span className="circ"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
                </div>
              </>
            )}
            <div className="meta-tl"><span className="ndot" style={{width:8,height:8,borderRadius:'50%',background:'#33ff77',boxShadow:'0 0 8px #33ff77',display:'inline-block'}}></span><span>// playing — sound on</span></div>
            <div className="meta-tr">{lightboxReel.year} · {lightboxReel.kind}</div>
            {!lightboxReel.yt && (
              <div className="bottom">
                <div className="ttl">{lightboxReel.title}</div>
              </div>
            )}
            <div className="close" onClick={() => setLightboxReel(null)}>
              <span>close</span><span className="x">×</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CasePage = CasePage;
