import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, TextInput, BackHandler } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? RNStatusBar.currentHeight : 0;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - (SCREEN_WIDTH * 0.12);
const CARD_GAP = 10;

export default function App() {
  const [showMainPage, setShowMainPage] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, notifications, events, messages, settings, calendar, profile, messageDetail, messageCreate, eventCreate, eventDetail, eventEdit
  const [showCaptainOnly, setShowCaptainOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(null);
  const [eventCaptain, setEventCaptain] = useState('');
  const [eventBackupCaptain, setEventBackupCaptain] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventNameError, setEventNameError] = useState(false);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [editEventDate, setEditEventDate] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({ type: '', message: '' });
  const [showCreateEventPrompt, setShowCreateEventPrompt] = useState(false);
  const [createEventPromptDate, setCreateEventPromptDate] = useState(null);
  const breathingAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const menuSlideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

  // Centralized events data
  const eventsData = [
    { id: 1, date: '2025-10-12', name: 'Tanışma Toplantısı', time: '14:00', location: 'İTÜ Merkez Kampüs', text: 'Yeni üyelerimizle tanışma ve kaynaşma toplantısı. Kulüp hakkında genel bilgiler verilecek ve dönem planları paylaşılacak.', color: '#6B8E9E', hasImage: true, captain: 'Ahmet', coCaptain: 'Zeynep' },
    { id: 2, date: '2025-10-17', name: 'Kadıköy Gezisi', time: '10:00', location: 'Kadıköy Rıhtım', text: 'Sokak fotoğrafçılığı pratiği için Kadıköy gezisi. Sabah erken saatlerde buluşup akşam üzeri sona erecek.', color: '#8B7355', hasImage: true, captain: 'Mert', coCaptain: 'Emre' },
    { id: 3, date: '2025-10-25', name: 'Teknik Eğitim 102', time: '16:00', location: 'İTÜ Fotoğraf Kulübü', text: 'Kompozisyon teknikleri ve ışık kullanımı üzerine detaylı eğitim. Temel seviye bilgi gerektirir.', color: '#7A8B99', hasImage: true, captain: 'Selin', coCaptain: 'Mert' },
    { id: 4, date: '2025-11-02', name: 'Portre Çekimi Workshop', time: '13:00', location: 'İTÜ Stüdyo', text: 'Profesyonel portre fotoğrafçılığı teknikleri workshop. Stüdyo ekipmanları kullanımı öğretilecek.', color: '#9B8B7E', hasImage: true, captain: 'Elif' },
    { id: 5, date: '2025-11-08', name: 'Gece Fotoğrafçılığı', time: '20:00', location: 'Ortaköy Sahil', text: 'Uzun pozlama ve gece fotoğrafçılığı pratiği. Tripod getirmek zorunludur.', color: '#5A6B7A', hasImage: true, captain: 'Mert' },
    { id: 6, date: '2025-11-15', name: 'Botanik Gezisi', captain: 'Ayşe', hasImage: false },
  ];

  useEffect(() => {
    // Load custom fonts
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Inter_18pt-Light': require('./assets/fonts/Inter_18pt-Light.ttf'),
          'Inter_18pt-Medium': require('./assets/fonts/Inter_18pt-Medium.ttf'),
          'Inter_18pt-Bold': require('./assets/fonts/Inter_18pt-Bold.ttf'),
          'Inter_18pt-Regular': require('./assets/fonts/Inter_18pt-Regular.ttf'),
        });
      } catch (error) {
        console.error('Error loading fonts', error);
      } finally {
        setFontsLoaded(true);
      }
    };
    
    loadFonts();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    // Start combined breathing animation (subtle scale + fade)
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Scale up and fade in (subtle growth)
        Animated.parallel([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(logoFadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        // Keep size, fade out
        Animated.timing(logoFadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        // Reset scale for next cycle
        Animated.timing(breathingAnim, {
          toValue: 0.75,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    // Show main page after 1.5 seconds with fade transition
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowMainPage(true);
        fadeAnim.setValue(1);
      });
    }, 1500);

    return () => {
      breathingAnimation.stop();
      clearTimeout(timer);
    };
  }, [fontsLoaded]);

  const toggleMenu = () => {
    const toValue = menuOpen ? -SCREEN_WIDTH * 0.75 : 0;
    Animated.timing(menuSlideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    toggleMenu();
  };

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  const handleConfirmDialogAction = () => {
    setShowConfirmDialog(false);
    
    switch (confirmDialogData.type) {
      case 'saveChanges':
        // Save changes logic here
        navigateToPage('eventDetail');
        break;
      case 'deleteFromEdit':
        // Delete event logic here
        navigateToPage('events');
        break;
      case 'deleteFromDetail':
        // Delete event logic here
        navigateToPage('events');
        break;
      default:
        break;
    }
  };

  const handleCreateEventFromCalendar = () => {
    setEventDate(createEventPromptDate);
    setShowCreateEventPrompt(false);
    navigateToPage('eventCreate');
  };

  const handleBackPress = () => {
    // Define navigation hierarchy
    const navigationMap = {
      'messageDetail': 'messages',
      'messageCreate': 'messages',
      'eventCreate': 'events',
      'eventDetail': 'events',
      'eventEdit': 'eventDetail',
    };
    
    const previousPage = navigationMap[currentPage];
    if (previousPage) {
      setCurrentPage(previousPage);
      return true; // Prevent default behavior (exit app)
    }
    return false; // Allow default behavior for main pages
  };

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => backHandler.remove();
  }, [currentPage]);

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'notifications':
        return renderNotifications();
      case 'events':
        return renderEvents();
      case 'messages':
        return renderMessages();
      case 'settings':
        return renderSettings();
      case 'calendar':
        return renderCalendar();
      case 'profile':
        return renderProfile();
      case 'messageDetail':
        return renderMessageDetail();
      case 'messageCreate':
        return renderMessageCreate();
      case 'eventCreate':
        return renderEventCreate();
      case 'eventDetail':
        return renderEventDetail();
      case 'eventEdit':
        return renderEventEdit();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dashboardHeader}>
        <View style={styles.profileFrame} />
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeMessage}>Hoş geldin 👋</Text>
          <Text style={styles.userName}>Mert</Text>
        </View>
      </View>
      <View style={styles.dateSectionRow}>
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Tarih:</Text>
          <Text style={styles.dateValue}>
            {(() => {
              const today = new Date();
              const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
              return `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
            })()}
          </Text>
        </View>
        <TouchableOpacity style={styles.calendarButton} onPress={() => navigateToPage('calendar')}>
          <Text style={styles.calendarButtonText}>Takvime git</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.upcomingEventsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.upcomingEventsTitle}>Yaklaşan Etkinlikler</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateToPage('events')}>
            <Text style={styles.sectionButtonText}>Etkinliklere git</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          style={styles.carousel}
        >
          <View style={[styles.eventCard, { backgroundColor: '#6B8E9E' }]}>
            <View style={styles.imageWrapper}>
              <Image 
                source={require('./assets/placeholder_tanisma_toplantisi.jpg')} 
                style={styles.eventImage}
              />
            </View>
            <LinearGradient
              colors={['#6B8E9E', '#6B8E9E', 'rgba(107,142,158,0.8)', 'rgba(107,142,158,0.6)', 'rgba(107,142,158,0.3)', 'rgba(107,142,158,0)']}
              locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.imageOpacityMask}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>Tanışma Toplantısı</Text>
              <Text style={styles.eventDate}>12 Ekim Pazar (3 gün kaldı)</Text>
            </View>
          </View>
          <View style={[styles.eventCard, { backgroundColor: '#8B7355' }]}>
            <View style={styles.imageWrapper}>
              <Image 
                source={require('./assets/placeholder_kadikoy_gezisi.jpg')} 
                style={styles.eventImage}
              />
            </View>
            <LinearGradient
              colors={['#8B7355', '#8B7355', 'rgba(139,115,85,0.8)', 'rgba(139,115,85,0.6)', 'rgba(139,115,85,0.3)', 'rgba(139,115,85,0)']}
              locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.imageOpacityMask}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>Kadıköy Gezisi</Text>
              <Text style={styles.eventDate}>17 Ekim Cuma (8 gün kaldı)</Text>
              <View style={styles.captainBadge}>
                <Text style={styles.captainText}>Bu etkinlikte kaptansın! ⚡</Text>
              </View>
            </View>
          </View>
          <View style={[styles.eventCard, { backgroundColor: '#7A8B99' }]}>
            <View style={styles.imageWrapper}>
              <Image 
                source={require('./assets/placeholder_teknik_egitim_102.jpg')} 
                style={styles.eventImage}
              />
            </View>
            <LinearGradient
              colors={['#7A8B99', '#7A8B99', 'rgba(122,139,153,0.8)', 'rgba(122,139,153,0.6)', 'rgba(122,139,153,0.3)', 'rgba(122,139,153,0)']}
              locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.imageOpacityMask}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventName}>Teknik Eğitim 102</Text>
              <Text style={styles.eventDate}>25 Ekim Cumartesi (16 gün kaldı)</Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.messageBoardSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.messageBoardTitle}>Mesaj Panosu</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateToPage('messages')}>
            <Text style={styles.sectionButtonText}>Mesaj panosuna git</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 1, sender: 'Ayşe', title: 'Gelecek hafta için ekipman kontrolü'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.avatarInitial}>A</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Ayşe</Text>
                <Text style={styles.messageDate}>2 saat önce</Text>
              </View>
              <Text style={styles.messageTitle}>Gelecek hafta için ekipman kontrolü</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Merhabalar! Önümüzdeki hafta yapacağımız çekim için ekipmanları kontrol etmemiz gerekiyor. Özellikle lens ve tripod sayısını netleştirmemiz lazım. Herkes elindeki malzemelerin listesini paylaşabilir mi?
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 12 yanıt</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 2, sender: 'Emre', title: 'Fotoğraf yarışması başvuruları'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.avatarInitial}>E</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Emre</Text>
                <Text style={styles.messageDate}>5 saat önce</Text>
              </View>
              <Text style={styles.messageTitle}>Fotoğraf yarışması başvuruları</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Arkadaşlar, şehir genelindeki fotoğraf yarışmasına toplu başvuru yapmayı düşünüyoruz. Katılmak isteyen varsa bu akşam saat 20:00'de online toplantıda buluşalım. Detayları orada konuşuruz.
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 8 yanıt</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 3, sender: 'Zeynep', title: 'Lightroom eğitimi kaydı'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#95E1D3' }]}>
              <Text style={styles.avatarInitial}>Z</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Zeynep</Text>
                <Text style={styles.messageDate}>Dün</Text>
              </View>
              <Text style={styles.messageTitle}>Lightroom eğitimi kaydı</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Geçen hafta yaptığımız Lightroom eğitiminin kaydını Drive'a yükledim. Katılamayanlar için çok faydalı olacağını düşünüyorum. Link pano açıklamasında. İyi çalışmalar!
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 25 yanıt</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderNotifications = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Bildirimler</Text>
      
      {/* Tagged Message Notification */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>💬</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            <Text style={styles.notificationBold}>Ahmet</Text> sizi bir mesajda etiketledi
          </Text>
          <Text style={styles.notificationTimeCompact}>1 saat önce</Text>
        </View>
      </TouchableOpacity>

      {/* Event Reminder - 5 days */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>⚠️</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            <Text style={styles.notificationBold}>Kadıköy Gezisi</Text> için duyuru yapılmadı
          </Text>
          <Text style={styles.notificationTimeCompact}>3 saat önce</Text>
        </View>
      </TouchableOpacity>

      {/* Event Reminder - 1 day */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>🔔</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            <Text style={styles.notificationBold}>Tanışma Toplantısı</Text> yarın başlıyor
          </Text>
          <Text style={styles.notificationTimeCompact}>Dün</Text>
        </View>
      </TouchableOpacity>

      {/* Tagged Message Notification 2 */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>💬</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            <Text style={styles.notificationBold}>Zeynep</Text> sizi bir mesajda etiketledi
          </Text>
          <Text style={styles.notificationTimeCompact}>2 gün önce</Text>
        </View>
      </TouchableOpacity>

      {/* Backup Captain Reminder */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>🔔</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            <Text style={styles.notificationBold}>Teknik Eğitim 102</Text> için yedek kaptansınız
          </Text>
          <Text style={styles.notificationTimeCompact}>3 gün önce</Text>
        </View>
      </TouchableOpacity>

      {/* New Member Notification */}
      <TouchableOpacity style={styles.notificationCardCompact} onPress={() => {}}>
        <Text style={styles.notificationIconCompact}>👋</Text>
        <View style={styles.notificationInfoCompact}>
          <Text style={styles.notificationContentCompact}>
            Kulübe 3 yeni üye katıldı
          </Text>
          <Text style={styles.notificationTimeCompact}>4 gün önce</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEvents = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Etkinlikler</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigateToPage('eventCreate')}
          >
            <Image source={require('./assets/add.png')} style={styles.createButtonIcon} />
            <Text style={styles.createButtonText}>Etkinlik oluştur</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, showCaptainOnly && styles.filterButtonActive]}
            onPress={() => setShowCaptainOnly(!showCaptainOnly)}
          >
            <Text style={[styles.filterButtonText, showCaptainOnly && styles.filterButtonTextActive]}>
              Kaptan olunan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, showPastEvents && styles.filterButtonActive]}
            onPress={() => setShowPastEvents(!showPastEvents)}
          >
            <Text style={[styles.filterButtonText, showPastEvents && styles.filterButtonTextActive]}>
              Geçmiş etkinlikleri de göster
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Cards */}
        {eventsData.map((event) => {
          const eventDate = event.date ? new Date(event.date) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
          const isPastEvent = eventDate ? eventDate < today : false;
          
          // Filter out past events if showPastEvents is false
          if (isPastEvent && !showPastEvents) {
            return null;
          }
          
          const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
          const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
          
          return (
            <TouchableOpacity 
              key={event.id}
              style={[
                styles.eventCardLarge, 
                { backgroundColor: event.hasImage ? event.color : '#999' },
                isPastEvent && { opacity: 0.25 }
              ]}
              onPress={() => {
                setSelectedEvent(event);
                navigateToPage('eventDetail');
              }}
            >
              {event.hasImage && (
                <>
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={require('./assets/placeholder_tanisma_toplantisi.jpg')} 
                      style={styles.eventImage}
                    />
                  </View>
                  <LinearGradient
                    colors={[
                      event.color, 
                      event.color, 
                      `${event.color}CC`, 
                      `${event.color}99`, 
                      `${event.color}4D`, 
                      `${event.color}00`
                    ]}
                    locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.imageOpacityMask}
                  />
                </>
              )}
              {isPastEvent && (
                <View style={styles.pastEventWhiteOverlay} />
              )}
              <View style={styles.eventContentLarge}>
                <Text style={styles.eventNameLarge}>{event.name}</Text>
                {eventDate && event.time ? (
                  <Text style={styles.eventDateTime}>
                    {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]} • {event.time}
                  </Text>
                ) : eventDate ? (
                  <Text style={styles.eventDateTime}>
                    {eventDate.getDate()} {monthNames[eventDate.getMonth()]} {dayNames[eventDate.getDay()]}
                  </Text>
                ) : (
                  <Text style={styles.eventDateTime}>Tarih belirlenmedi</Text>
                )}
                {event.captain && (
                  <View style={styles.captainBadge}>
                    <Text style={styles.captainText}>Kaptan: {event.captain}</Text>
                  </View>
                )}
                {event.isCaptain && (
                  <View style={styles.captainBadge}>
                    <Text style={styles.captainText}>Bu etkinlikte kaptansın! ⚡</Text>
                  </View>
                )}
                {event.isBackupCaptain && (
                  <View style={styles.backupCaptainBadge}>
                    <Text style={styles.backupCaptainText}>Yedek kaptansın 🔄</Text>
                  </View>
                )}
                {event.announced !== undefined && (
                  event.announced ? (
                    <View style={styles.announcementBadgeInline}>
                      <Text style={styles.announcementBadgeInlineText}>✓ Duyuru yapıldı</Text>
                    </View>
                  ) : (
                    <View style={styles.announcementBadgeWarningInline}>
                      <Text style={styles.announcementBadgeWarningInlineText}>⚠ Duyuru yapılmadı</Text>
                    </View>
                  )
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderMessages = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Mesaj Panosu</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigateToPage('messageCreate')}
          >
            <Image source={require('./assets/add.png')} style={styles.createButtonIcon} />
            <Text style={styles.createButtonText}>Mesaj oluştur</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, showTaggedOnly && styles.filterButtonActive]}
            onPress={() => setShowTaggedOnly(!showTaggedOnly)}
          >
            <Text style={[styles.filterButtonText, showTaggedOnly && styles.filterButtonTextActive]}>
              Etiketlenilen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
            onPress={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Text style={[styles.filterButtonText, showUnreadOnly && styles.filterButtonTextActive]}>
              Okunmamış
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unread Message */}
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 1, sender: 'Ayşe', title: 'Gelecek hafta için ekipman kontrolü'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.unreadIndicator} />
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.avatarInitial}>A</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Ayşe</Text>
                <Text style={styles.messageDate}>2 saat önce</Text>
              </View>
              <Text style={styles.messageTitle}>Gelecek hafta için ekipman kontrolü</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Merhabalar! Önümüzdeki hafta yapacağımız çekim için ekipmanları kontrol etmemiz gerekiyor. Özellikle lens ve tripod sayısını netleştirmemiz lazım. Herkes elindeki malzemelerin listesini paylaşabilir mi?
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 12 yanıt</Text>
          </View>
        </TouchableOpacity>

        {/* Read Message */}
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 2, sender: 'Emre', title: 'Fotoğraf yarışması başvuruları'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.avatarInitial}>E</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Emre</Text>
                <Text style={styles.messageDate}>5 saat önce</Text>
              </View>
              <Text style={styles.messageTitle}>Fotoğraf yarışması başvuruları</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Arkadaşlar, şehir genelindeki fotoğraf yarışmasına toplu başvuru yapmayı düşünüyoruz. Katılmak isteyen varsa bu akşam saat 20:00'de online toplantıda buluşalım. Detayları orada konuşuruz.
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 8 yanıt</Text>
          </View>
        </TouchableOpacity>

        {/* Unread Tagged Message */}
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 3, sender: 'Zeynep', title: 'Lightroom eğitimi kaydı'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.unreadIndicator} />
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#95E1D3' }]}>
              <Text style={styles.avatarInitial}>Z</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Zeynep</Text>
                <Text style={styles.messageDate}>Dün</Text>
              </View>
              <Text style={styles.messageTitle}>Lightroom eğitimi kaydı</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Geçen hafta yaptığımız Lightroom eğitiminin kaydını Drive'a yükledim. @Mert eğitim materyallerini de paylaşabilir misin? Katılamayanlar için çok faydalı olacağını düşünüyorum.
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 25 yanıt</Text>
            <View style={styles.taggedBadge}>
              <Text style={styles.taggedBadgeText}>@ Etiketlendiniz</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Read Message */}
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 4, sender: 'Mehmet', title: 'Yeni üye tanıtımı'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#FFB6B9' }]}>
              <Text style={styles.avatarInitial}>M</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Mehmet</Text>
                <Text style={styles.messageDate}>2 gün önce</Text>
              </View>
              <Text style={styles.messageTitle}>Yeni üye tanıtımı</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Merhaba arkadaşlar! Bu hafta kulübümüze 3 yeni üye katıldı. Herkesi tanışma toplantısına davet ediyoruz. Yeni üyelerimize hoş geldiniz diyoruz!
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 15 yanıt</Text>
          </View>
        </TouchableOpacity>

        {/* Unread Message */}
        <TouchableOpacity 
          style={styles.messageCard}
          onPress={() => {
            setSelectedMessage({id: 5, sender: 'Selin', title: 'Fotoğraf sergisi önerisi'});
            navigateToPage('messageDetail');
          }}
        >
          <View style={styles.unreadIndicator} />
          <View style={styles.messageHeader}>
            <View style={[styles.userAvatar, { backgroundColor: '#A8E6CF' }]}>
              <Text style={styles.avatarInitial}>S</Text>
            </View>
            <View style={styles.messageHeaderInfo}>
              <View style={styles.messageTopRow}>
                <Text style={styles.messageSender}>Selin</Text>
                <Text style={styles.messageDate}>3 gün önce</Text>
              </View>
              <Text style={styles.messageTitle}>Fotoğraf sergisi önerisi</Text>
            </View>
          </View>
          <Text style={styles.messageContent} numberOfLines={3}>
            Şehir merkezinde açılan yeni fotoğraf sergisini gördünüz mü? Çok etkileyici işler var. Toplu olarak gidip inceleyebiliriz. Ne dersiniz?
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.replyCount}>💬 7 yanıt</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderSettings = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Seçenekler</Text>
        
        <View style={styles.settingsSection}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Karanlık Mod</Text>
              <Text style={styles.settingDescription}>Uygulamayı karanlık temada kullan</Text>
            </View>
            <TouchableOpacity 
              style={[styles.toggle, darkMode && styles.toggleActive]}
              onPress={() => setDarkMode(!darkMode)}
            >
              <View style={[styles.toggleThumb, darkMode && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderCalendar = () => {
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

      const days = [];
      
      // Add empty cells for days before the first day of month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    };

    const getEventsForDate = (date) => {
      if (!date) return [];
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return eventsData.filter(event => event.date === dateStr);
    };

    const getEventForDay = (day) => {
      if (!day) return null;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      return dayEvents.length > 0 ? dayEvents[0] : null;
    };

    const goToPreviousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayPress = (day) => {
      if (day) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > 0) {
          setSelectedEvent(dayEvents[0]);
          navigateToPage('eventDetail');
        } else {
          // Show create event prompt for empty day
          setCreateEventPromptDate(date);
          setShowCreateEventPrompt(true);
        }
      }
    };

    const isToday = (day) => {
      if (!day) return false;
      const today = new Date();
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentMonth);

    return (
      <View style={styles.calendarFullScreen}>
        <Text style={styles.pageTitle}>Takvim</Text>
        
        {/* Calendar Header - Month Navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonthYear}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calendarNavButton}>
            <Text style={styles.calendarNavButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid - Full Screen */}
        <View style={styles.calendarContainerFull}>
          {/* Day Names Header */}
          <View style={styles.calendarDayNamesRow}>
            {dayNames.map((dayName, index) => (
              <View key={index} style={styles.calendarDayNameCell}>
                <Text style={styles.calendarDayNameText}>{dayName}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <View style={styles.calendarDaysGridFull}>
            {days.map((day, index) => {
              const event = getEventForDay(day);
              const eventColor = event ? (event.hasImage ? event.color : '#999') : null;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDayCellFull,
                    !day && styles.calendarDayCellEmpty,
                    event && { backgroundColor: eventColor },
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day}
                >
                  {day ? (
                    <View style={styles.calendarDayCellContentFull}>
                      <Text style={[
                        styles.calendarDayTextFull,
                        event && styles.calendarDayTextWithEvent,
                        isToday(day) && styles.calendarDayTextTodayBold,
                      ]}>
                        {day}
                      </Text>
                      {event && (
                        <Text style={styles.calendarEventNameInCell} numberOfLines={2}>
                          {event.name}
                        </Text>
                      )}
                      {isToday(day) && !event && (
                        <View style={styles.todayIndicator} />
                      )}
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderProfile = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Profil</Text>
      
      <View style={styles.profileHeader}>
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture} />
          <TouchableOpacity style={styles.changePictureButton}>
            <Image source={require('./assets/camera.png')} style={styles.changePictureIcon} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Mert</Text>
          <Text style={styles.profileRole}>Yönetim Kurulu Üyesi</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileSectionHeader}>
          <Text style={styles.profileSectionTitle}>Kişisel Bilgiler</Text>
          <TouchableOpacity>
            <Image source={require('./assets/edit.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileField}>
          <Text style={styles.profileFieldLabel}>E-posta</Text>
          <Text style={styles.profileFieldValue}>mert@itufk.com</Text>
        </View>
        
        <View style={styles.profileField}>
          <Text style={styles.profileFieldLabel}>Telefon</Text>
          <Text style={styles.profileFieldValue}>+90 555 123 4567</Text>
        </View>
        
        <View style={styles.profileField}>
          <Text style={styles.profileFieldLabel}>Üyelik Tarihi</Text>
          <Text style={styles.profileFieldValue}>15 Eylül 2024</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>İstatistikler</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Etkinlik</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Kaptan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>48</Text>
            <Text style={styles.statLabel}>Mesaj</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMessageDetail = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.messageDetailCard}>
        <View style={styles.messageHeader}>
          <View style={[styles.userAvatar, { backgroundColor: '#FF6B6B' }]}>
            <Text style={styles.avatarInitial}>{selectedMessage?.sender?.charAt(0) || 'A'}</Text>
          </View>
          <View style={styles.messageHeaderInfo}>
            <Text style={styles.messageSender}>{selectedMessage?.sender || 'Ayşe'}</Text>
            <Text style={styles.messageDate}>2 saat önce</Text>
          </View>
        </View>
        
        <Text style={styles.messageDetailTitle}>{selectedMessage?.title || 'Gelecek hafta için ekipman kontrolü'}</Text>
        
        <Text style={styles.messageDetailContent}>
          Merhabalar! Önümüzdeki hafta yapacağımız çekim için ekipmanları kontrol etmemiz gerekiyor. Özellikle lens ve tripod sayısını netleştirmemiz lazım. Herkes elindeki malzemelerin listesini paylaşabilir mi?
        </Text>
      </View>

      <View style={styles.repliesSection}>
        <Text style={styles.repliesSectionTitle}>Yanıtlar (12)</Text>
        
        <View style={styles.replyCard}>
          <View style={styles.replyHeader}>
            <View style={[styles.userAvatarSmall, { backgroundColor: '#4ECDC4' }]}>
              <Text style={styles.avatarInitialSmall}>E</Text>
            </View>
            <View style={styles.replyHeaderInfo}>
              <Text style={styles.replySender}>Emre</Text>
              <Text style={styles.replyDate}>1 saat önce</Text>
            </View>
          </View>
          <Text style={styles.replyContent}>Bende 2 tripod var, getirebilirim.</Text>
        </View>

        <View style={styles.replyCard}>
          <View style={styles.replyHeader}>
            <View style={[styles.userAvatarSmall, { backgroundColor: '#95E1D3' }]}>
              <Text style={styles.avatarInitialSmall}>Z</Text>
            </View>
            <View style={styles.replyHeaderInfo}>
              <Text style={styles.replySender}>Zeynep</Text>
              <Text style={styles.replyDate}>45 dakika önce</Text>
            </View>
          </View>
          <Text style={styles.replyContent}>Ben de lens setimi getireceğim. 50mm ve 85mm var.</Text>
        </View>

        <View style={styles.replyCard}>
          <View style={styles.replyHeader}>
            <View style={[styles.userAvatarSmall, { backgroundColor: '#FFB6B9' }]}>
              <Text style={styles.avatarInitialSmall}>M</Text>
            </View>
            <View style={styles.replyHeaderInfo}>
              <Text style={styles.replySender}>Mehmet</Text>
              <Text style={styles.replyDate}>30 dakika önce</Text>
            </View>
          </View>
          <Text style={styles.replyContent}>Harika! Ben de reflektör ve ışık ekipmanlarını hazırlayayım.</Text>
        </View>
      </View>

      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          placeholder="Yanıt yaz..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton}>
          <Image source={require('./assets/send.png')} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMessageCreate = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Yeni Mesaj</Text>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Başlık</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Mesaj başlığı..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>İçerik</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={8}
        />
      </View>

      <View style={styles.createFormActions}>
        <TouchableOpacity style={styles.attachButton}>
          <Image source={require('./assets/attach.png')} style={styles.attachIcon} />
          <Text style={styles.attachButtonText}>Dosya Ekle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.attachButton}>
          <Image source={require('./assets/image.png')} style={styles.attachIcon} />
          <Text style={styles.attachButtonText}>Resim Ekle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Mesajı Gönder</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEventCreate = () => {
    const handleCreateEvent = () => {
      if (!eventName.trim()) {
        setEventNameError(true);
        return;
      }
      // Here you would create the event
      // For now, just reset form and navigate back
      setEventName('');
      setEventDate(null);
      setEventCaptain('');
      setEventBackupCaptain('');
      setEventNameError(false);
      navigateToPage('events');
    };

    const formatDate = (date) => {
      if (!date) return '';
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.dashboardScrollView}
          contentContainerStyle={styles.dashboardContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Yeni Etkinlik</Text>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Etkinlik Adı</Text>
            <TextInput
              style={[
                styles.formInput,
                eventNameError && styles.formInputError
              ]}
              placeholder="Etkinlik adı"
              placeholderTextColor="#999"
              value={eventName}
              onChangeText={(text) => {
                setEventName(text);
                if (text.trim()) setEventNameError(false);
              }}
            />
            {eventNameError && (
              <Text style={styles.formErrorText}>Etkinlik adı zorunludur</Text>
            )}
          </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Tarih</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={eventDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                {eventDate ? formatDate(eventDate) : 'Tarih seç'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Kaptan</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Kaptan adı"
              placeholderTextColor="#999"
              value={eventCaptain}
              onChangeText={setEventCaptain}
            />
          </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Yedek Kaptan</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Yedek kaptan adı"
              placeholderTextColor="#999"
              value={eventBackupCaptain}
              onChangeText={setEventBackupCaptain}
            />
          </View>

          <View style={styles.eventCreateNote}>
            <Text style={styles.eventCreateNoteText}>
              💡 Etkinlik detayları (saat, konum, açıklama, resim) daha sonra düzenlenebilir.
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateEvent}>
            <Text style={styles.submitButtonText}>Etkinliği Oluştur</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Tarih Seç</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {/* Simple date selection - next 60 days */}
                {Array.from({ length: 60 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return date;
                }).map((date, index) => {
                  const isSelected = eventDate && date.toDateString() === eventDate.toDateString();
                  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEventDate(date);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()} - {dayNames[date.getDay()]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEventDetail = () => {
    const event = selectedEvent || eventsData[0];
    const eventDate = event.date ? new Date(event.date) : null;
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const formatDate = (date) => {
      if (!date) return '-';
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eventDetailHeader}>
          <Text style={styles.eventDetailTitle}>{event.name}</Text>
          <TouchableOpacity 
            style={styles.eventEditButton}
            onPress={() => navigateToPage('eventEdit')}
          >
            <Image source={require('./assets/edit.png')} style={styles.eventEditIcon} />
            <Text style={styles.eventEditButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventDetailSection}>
          <View style={styles.eventDetailRow}>
            <Text style={styles.eventDetailLabel}>Tarih</Text>
            <Text style={[styles.eventDetailValue, !eventDate && styles.eventDetailValueEmpty]}>
              {formatDate(eventDate)}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Text style={styles.eventDetailLabel}>Saat</Text>
            <Text style={[styles.eventDetailValue, !event.time && styles.eventDetailValueEmpty]}>
              {event.time || '-'}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Text style={styles.eventDetailLabel}>Konum</Text>
            <Text style={[styles.eventDetailValue, !event.location && styles.eventDetailValueEmpty]}>
              {event.location || '-'}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Text style={styles.eventDetailLabel}>Kaptan</Text>
            <Text style={[styles.eventDetailValue, !event.captain && styles.eventDetailValueEmpty]}>
              {event.captain || '-'}
            </Text>
          </View>

          <View style={styles.eventDetailRow}>
            <Text style={styles.eventDetailLabel}>Yardımcı Kaptan</Text>
            <Text style={[styles.eventDetailValue, !(event.backupCaptain || event.coCaptain) && styles.eventDetailValueEmpty]}>
              {event.backupCaptain || event.coCaptain || '-'}
            </Text>
          </View>
        </View>

        {(event.text || event.description) && (
          <View style={styles.eventDetailSection}>
            <Text style={styles.eventDetailSectionTitle}>Metin</Text>
            <Text style={styles.eventDetailDescription}>{event.text || event.description}</Text>
          </View>
        )}

        {event.hasImage ? (
          <View style={styles.eventDetailSection}>
            <Text style={styles.eventDetailSectionTitle}>Etkinlik Görseli</Text>
            <View style={styles.eventImagePreview}>
              <Image 
                source={require('./assets/placeholder_tanisma_toplantisi.jpg')} 
                style={styles.eventImagePreviewImage}
              />
            </View>
          </View>
        ) : (
          <View style={styles.eventDetailSection}>
            <Text style={styles.eventDetailSectionTitle}>Etkinlik Görseli</Text>
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImagePlaceholderText}>Görsel eklenmedi</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => {
            setConfirmDialogData({
              type: 'deleteFromDetail',
              message: 'Bu etkinliği silmek istediğinizden emin misiniz?'
            });
            setShowConfirmDialog(true);
          }}
        >
          <Text style={styles.deleteButtonText}>Etkinliği Sil</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderEventEdit = () => {
    const event = selectedEvent || eventsData[0];
    const eventDate = event.date ? new Date(event.date) : null;
    
    // Initialize editEventDate if not set
    if (editEventDate === null && eventDate) {
      setEditEventDate(eventDate);
    }
    
    const handleDeleteEvent = () => {
      setConfirmDialogData({
        type: 'deleteFromEdit',
        message: 'Bu etkinliği silmek istediğinizden emin misiniz?'
      });
      setShowConfirmDialog(true);
    };
    
    const handleSaveChanges = () => {
      setConfirmDialogData({
        type: 'saveChanges',
        message: 'Değişiklikleri kaydetmek istediğinizden emin misiniz?'
      });
      setShowConfirmDialog(true);
    };
    
    const formatDate = (date) => {
      if (!date) return '';
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };
    
    return (
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.dashboardScrollView}
          contentContainerStyle={styles.dashboardContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Etkinliği Düzenle</Text>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Etkinlik Adı</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Etkinlik adı"
              placeholderTextColor="#999"
              defaultValue={event.name}
            />
          </View>

          <View style={styles.createFormSection}>
            <Text style={styles.formLabel}>Tarih</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={editEventDate || eventDate ? styles.datePickerText : styles.datePickerPlaceholder}>
                {editEventDate ? formatDate(editEventDate) : (eventDate ? formatDate(eventDate) : 'Tarih seç')}
              </Text>
            </TouchableOpacity>
          </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Saat</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Saat"
            placeholderTextColor="#999"
            defaultValue={event.time || ''}
          />
        </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Konum</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Konum"
            placeholderTextColor="#999"
            defaultValue={event.location || ''}
          />
        </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Metin</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Etkinlik metni"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            defaultValue={event.text || event.description || ''}
          />
        </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Kaptan</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Kaptan"
            placeholderTextColor="#999"
            defaultValue={event.captain || ''}
          />
        </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Yardımcı Kaptan</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Yardımcı kaptan"
            placeholderTextColor="#999"
            defaultValue={event.backupCaptain || event.coCaptain || ''}
          />
        </View>

        <View style={styles.createFormSection}>
          <Text style={styles.formLabel}>Etkinlik Görseli</Text>
          <TouchableOpacity style={styles.imageUploadButton}>
            <Image source={require('./assets/image.png')} style={styles.imageUploadIcon} />
            <Text style={styles.imageUploadText}>
              {event.hasImage ? 'Görseli Değiştir' : 'Görsel Ekle'}
            </Text>
          </TouchableOpacity>
        </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSaveChanges}>
            <Text style={styles.submitButtonText}>Değişiklikleri Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
            <Text style={styles.deleteButtonText}>Etkinliği Sil</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Date Picker Modal for Edit */}
        {showEditDatePicker && (
          <View style={styles.datePickerOverlay}>
            <TouchableOpacity 
              style={styles.datePickerBackdrop}
              activeOpacity={1}
              onPress={() => setShowEditDatePicker(false)}
            />
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Tarih Seç</Text>
                <TouchableOpacity onPress={() => setShowEditDatePicker(false)}>
                  <Image source={require('./assets/close.png')} style={styles.datePickerCloseIcon} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.datePickerCalendar}>
                {/* Simple date selection - next 60 days */}
                {Array.from({ length: 60 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return date;
                }).map((date, index) => {
                  const isSelected = editEventDate && date.toDateString() === editEventDate.toDateString();
                  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.datePickerOption,
                        isSelected && styles.datePickerOptionSelected
                      ]}
                      onPress={() => {
                        setEditEventDate(date);
                        setShowEditDatePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.datePickerOptionText,
                        isSelected && styles.datePickerOptionTextSelected
                      ]}>
                        {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()} - {dayNames[date.getDay()]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (showMainPage) {
    return (
      <SafeAreaView style={styles.appContainer}>
        {/* Overlay for dimming when menu is open */}
        {menuOpen && (
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleMenu}
          />
        )}

        {/* Left Toolbar (Sliding Menu) */}
        <Animated.View 
          style={[
            styles.leftToolbar,
            { transform: [{ translateX: menuSlideAnim }] }
          ]}
        >
          <View style={styles.menuHeader}>
            <Image source={require('./assets/itufklogo.png')} style={styles.menuLogo} />
            <Text style={styles.menuAppName}>İTÜ FK</Text>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'dashboard' && styles.menuItemActive]} 
              onPress={() => navigateTo('dashboard')}
            >
              <Image source={require('./assets/dashboard.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Ana ekran</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'notifications' && styles.menuItemActive]} 
              onPress={() => navigateTo('notifications')}
            >
              <Image source={require('./assets/notifications.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Bildirimler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'events' && styles.menuItemActive]} 
              onPress={() => navigateTo('events')}
            >
              <Image source={require('./assets/events.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Etkinlikler</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'calendar' && styles.menuItemActive]} 
              onPress={() => navigateTo('calendar')}
            >
              <Image source={require('./assets/calendar.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Takvim</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'messages' && styles.menuItemActive]} 
              onPress={() => navigateTo('messages')}
            >
              <Image source={require('./assets/message_board.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Mesaj Panosu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'profile' && styles.menuItemActive]} 
              onPress={() => navigateTo('profile')}
            >
              <Image source={require('./assets/user.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, currentPage === 'settings' && styles.menuItemActive]} 
              onPress={() => navigateTo('settings')}
            >
              <Image source={require('./assets/settings.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Seçenekler</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Main Content with Top Drawer */}
        <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
          {/* Top Drawer */}
          <View style={styles.topDrawer}>
            <View style={styles.leftSection}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/menu.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
              
              {/* Conditionally show back button */}
              {['messageDetail', 'messageCreate', 'eventCreate', 'eventDetail', 'eventEdit'].includes(currentPage) && (
                <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
                  <View style={styles.iconFrame}>
                    <Image source={require('./assets/back.png')} style={styles.icon} />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.centerLogoContainer}>
              <Image source={require('./assets/itufklogo.png')} style={styles.topLogo} />
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setSearchOpen(true)}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/search.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/notifications.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page Content */}
          {renderPageContent()}

          {/* Notifications Dropdown */}
          {notificationsDropdownOpen && (
            <View style={styles.notificationsDropdown}>
              <TouchableOpacity 
                style={styles.notificationDropdownItem}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                }}
              >
                <Text style={styles.notificationDropdownIcon}>💬</Text>
                <View style={styles.notificationDropdownInfo}>
                  <Text style={styles.notificationDropdownTitle}>Bir mesajda etiketlendiniz</Text>
                  <Text style={styles.notificationDropdownTime}>1 saat önce</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notificationDropdownItem}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                }}
              >
                <Text style={styles.notificationDropdownIcon}>⚠️</Text>
                <View style={styles.notificationDropdownInfo}>
                  <Text style={styles.notificationDropdownTitle}>Etkinlik duyurusu yapılmadı</Text>
                  <Text style={styles.notificationDropdownTime}>3 saat önce</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.notificationDropdownItem}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                }}
              >
                <Text style={styles.notificationDropdownIcon}>🔔</Text>
                <View style={styles.notificationDropdownInfo}>
                  <Text style={styles.notificationDropdownTitle}>Etkinlik yaklaşıyor</Text>
                  <Text style={styles.notificationDropdownTime}>Dün</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.viewAllNotifications}
                onPress={() => {
                  setNotificationsDropdownOpen(false);
                  navigateToPage('notifications');
                }}
              >
                <Text style={styles.viewAllNotificationsText}>Tümünü gör</Text>
              </TouchableOpacity>
            </View>
          )}

          <StatusBar style="dark" />
        </Animated.View>

        {/* Search Overlay */}
        {searchOpen && (
          <View style={styles.searchOverlay}>
            <TouchableOpacity 
              style={styles.searchOverlayBackground}
              activeOpacity={1}
              onPress={() => setSearchOpen(false)}
            />
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Image source={require('./assets/search.png')} style={styles.searchInputIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ara..."
                  placeholderTextColor="#999"
                  autoFocus={true}
                />
                <TouchableOpacity onPress={() => setSearchOpen(false)}>
                  <Image source={require('./assets/close.png')} style={styles.searchCloseIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Emin misiniz?</Text>
              <Text style={styles.confirmDialogMessage}>{confirmDialogData.message}</Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => setShowConfirmDialog(false)}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={handleConfirmDialogAction}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Create Event Prompt */}
        {showCreateEventPrompt && (
          <View style={styles.confirmDialogOverlay}>
            <View style={styles.confirmDialogBox}>
              <Text style={styles.confirmDialogTitle}>Etkinlik Oluştur</Text>
              <Text style={styles.confirmDialogMessage}>
                {createEventPromptDate && 
                  `${createEventPromptDate.getDate()} ${['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][createEventPromptDate.getMonth()]} tarihinde bir etkinlik oluşturmak ister misiniz?`
                }
              </Text>
              <View style={styles.confirmDialogButtons}>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonCancel}
                  onPress={() => setShowCreateEventPrompt(false)}
                >
                  <Text style={styles.confirmDialogButtonCancelText}>Hayır</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.confirmDialogButtonConfirm}
                  onPress={handleCreateEventFromCalendar}
                >
                  <Text style={styles.confirmDialogButtonConfirmText}>Evet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
      <Animated.Image
        source={require('./assets/itufklogo.png')}
        style={[
          styles.logo,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: breathingAnim }],
          },
        ]}
      />
      <StatusBar style="auto" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: STATUS_BAR_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  leftToolbar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: '#fff',
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingTop: STATUS_BAR_HEIGHT + 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  menuLogo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginRight: 12,
  },
  menuAppName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 22,
    color: '#000',
  },
  menuItems: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 16,
    tintColor: '#666',
  },
  menuItemText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#333',
  },
  topDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  centerLogoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconButton: {
    padding: 5,
  },
  iconFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  topLogo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  dashboardScrollView: {
    flex: 1,
  },
  dashboardContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    marginRight: 15,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeMessage: {
    fontFamily: 'Inter_18pt-Light',
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  dateSectionRow: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dateSection: {
    alignSelf: 'flex-start',
  },
  dateLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#000',
    opacity: 0.5,
    marginBottom: 3,
  },
  dateValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    opacity: 0.5,
  },
  calendarButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  upcomingEventsSection: {
    marginTop: 20,
    width: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  upcomingEventsTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  sectionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  carousel: {
    width: '100%',
  },
  carouselContent: {
    paddingRight: HORIZONTAL_PADDING,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: 150,
    borderRadius: 12,
    marginRight: CARD_GAP,
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ scale: 2 }],
  },
  imageOpacityMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  eventContent: {
    position: 'absolute',
    left: 0,
    right: '25%',
    top: 0,
    bottom: 0,
    padding: 15,
    justifyContent: 'center',
  },
  eventName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  eventDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  captainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  captainText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#4ADE80',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  messageBoardSection: {
    marginTop: 20,
    width: '100%',
    marginBottom: 30,
  },
  messageBoardTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#000',
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  messageHeaderInfo: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  messageDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  messageTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#333',
  },
  messageContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 10,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyCount: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  // Page Title
  pageTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
  },
  // Notifications Page Styles
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
  },
  notificationTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  notificationContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationBold: {
    fontFamily: 'Inter_18pt-Medium',
    color: '#000',
  },
  // Events Page Styles
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#333',
  },
  filterButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  eventListItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  eventListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventListName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  eventListDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  announcementBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  announcementBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#4CAF50',
  },
  announcementBadgeWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  announcementBadgeWarningText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#FF9800',
  },
  captainBadgeSmall: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  captainBadgeSmallText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#22C55E',
  },
  // Messages Page Styles
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  taggedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 10,
  },
  taggedBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#2196F3',
  },
  // Settings Page Styles
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  // Menu Active State
  menuItemActive: {
    backgroundColor: '#f0f0f0',
  },
  // Compact Notification Styles
  notificationCardCompact: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconCompact: {
    fontSize: 28,
    marginRight: 12,
  },
  notificationInfoCompact: {
    flex: 1,
  },
  notificationContentCompact: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  notificationTimeCompact: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
  },
  // Search Overlay Styles
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  searchOverlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchContainer: {
    paddingTop: STATUS_BAR_HEIGHT + 15,
    paddingHorizontal: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInputIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#666',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#000',
  },
  searchCloseIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  // Notifications Dropdown Styles
  notificationsDropdown: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: SCREEN_WIDTH - 40,
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 5,
  },
  notificationDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
  },
  notificationDropdownIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationDropdownInfo: {
    flex: 1,
  },
  notificationDropdownTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
  },
  notificationDropdownTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 11,
    color: '#999',
  },
  viewAllNotifications: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
  },
  viewAllNotificationsText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#007AFF',
  },
  // Page Header Row
  pageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 6,
  },
  createButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#fff',
  },
  // Event Card Large
  eventCardLarge: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  pastEventWhiteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 1,
  },
  eventContentLarge: {
    position: 'absolute',
    left: 0,
    right: '25%',
    top: 0,
    bottom: 0,
    padding: 15,
    justifyContent: 'center',
    zIndex: 2,
  },
  eventNameLarge: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 20,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  eventDateTime: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
  announcementBadgeInline: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  announcementBadgeInlineText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#4ADE80',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  announcementBadgeWarningInline: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.6)',
  },
  announcementBadgeWarningInlineText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 10,
    color: '#FFB74D',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  backupCaptainBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(33, 150, 243, 0.6)',
  },
  backupCaptainText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 11,
    color: '#64B5F6',
    textShadowColor: '#000',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  // Calendar Styles - Full Screen
  calendarFullScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  calendarNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#007AFF',
  },
  calendarMonthYear: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
  },
  calendarContainerFull: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  calendarDayNamesRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  calendarDayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarDayNameText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 12,
    color: '#999',
  },
  calendarDaysGridFull: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayCellFull: {
    width: '13.5%',
    minHeight: 75,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 6,
    paddingTop: 8,
    marginRight: '0.7%',
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  calendarDayCellEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDayCellContentFull: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flex: 1,
  },
  calendarDayTextFull: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  calendarDayTextWithEvent: {
    color: '#fff',
    fontFamily: 'Inter_18pt-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  calendarDayTextTodayBold: {
    fontFamily: 'Inter_18pt-Bold',
  },
  calendarEventNameInCell: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 9,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 2,
  },
  todayIndicator: {
    marginTop: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  // Profile Styles
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  changePictureIcon: {
    width: 16,
    height: 16,
    tintColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#666',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  profileSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileSectionTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
  },
  editIcon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
  },
  profileField: {
    marginBottom: 15,
  },
  profileFieldLabel: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  profileFieldValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
  },
  // Message Detail Styles
  messageDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  messageDetailTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
    marginTop: 15,
    marginBottom: 15,
  },
  messageDetailContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  repliesSection: {
    marginBottom: 20,
  },
  repliesSectionTitle: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 18,
    color: '#000',
    marginBottom: 15,
  },
  replyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitialSmall: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 13,
    color: '#fff',
  },
  replyHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replySender: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
  },
  replyDate: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 11,
    color: '#999',
  },
  replyContent: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  replyInput: {
    flex: 1,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  // Create Form Styles
  createFormSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF0000',
    fontFamily: 'Inter_18pt-Bold',
  },
  eventCreateNote: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  eventCreateNoteText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 19,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
  },
  formInputError: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  formErrorText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#FF0000',
    marginTop: 5,
  },
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  datePickerText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#000',
  },
  datePickerPlaceholder: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#999',
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  datePickerTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#000',
  },
  datePickerCloseIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  datePickerCalendar: {
    maxHeight: 400,
  },
  datePickerOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  datePickerOptionText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#000',
  },
  datePickerOptionTextSelected: {
    fontFamily: 'Inter_18pt-Bold',
    color: '#007AFF',
  },
  createFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  attachIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
    marginRight: 8,
  },
  attachButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 13,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 16,
    color: '#fff',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  imageUploadIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
    marginRight: 10,
  },
  imageUploadText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#666',
  },
  // Event Detail Page Styles
  eventDetailHeader: {
    marginBottom: 20,
    position: 'relative',
  },
  eventDetailColorBar: {
    position: 'absolute',
    left: -20,
    top: 0,
    bottom: 0,
    width: 6,
  },
  eventDetailTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 28,
    color: '#000',
    marginBottom: 15,
  },
  eventEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventEditIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
    marginRight: 6,
  },
  eventEditButtonText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#fff',
  },
  eventDetailSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventDetailLabel: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#666',
  },
  eventDetailValue: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  eventDetailValueEmpty: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  eventDetailBadgeSection: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  eventDetailBadgeText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  eventDetailSectionTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  eventDetailDescription: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  eventAnnouncementStatus: {
    marginTop: 5,
  },
  announcementStatusGood: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  announcementStatusTextGood: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#4CAF50',
  },
  announcementStatusWarning: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  announcementStatusTextWarning: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 14,
    color: '#FF9800',
  },
  participantsList: {
    marginTop: 10,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInitial: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 14,
    color: '#fff',
  },
  participantName: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 15,
    color: '#000',
  },
  participantRole: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  eventImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  eventImagePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  eventImagePlaceholderText: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 14,
    color: '#999',
  },
  confirmDialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  confirmDialogBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmDialogTitle: {
    fontFamily: 'Inter_18pt-Bold',
    fontSize: 20,
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmDialogMessage: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmDialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  confirmDialogButtonCancel: {
    flex: 1,
    backgroundColor: '#e5e5e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDialogButtonCancelText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#666',
  },
  confirmDialogButtonConfirm: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmDialogButtonConfirmText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#fff',
  },
});
