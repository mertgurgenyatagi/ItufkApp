import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView, TextInput } from 'react-native';
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
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, notifications, events, messages, settings, calendar, profile, messageDetail, messageCreate, eventCreate
  const [showCaptainOnly, setShowCaptainOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const breathingAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const menuSlideAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

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
          <Text style={styles.dateValue}>9 Ekim 2025</Text>
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
        
        <View style={styles.messageCard}>
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
        </View>

        <View style={styles.messageCard}>
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
        </View>

        <View style={styles.messageCard}>
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
        </View>
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
        <TouchableOpacity style={[styles.eventCardLarge, { backgroundColor: '#6B8E9E' }]}>
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
          <View style={styles.eventContentLarge}>
            <Text style={styles.eventNameLarge}>Tanışma Toplantısı</Text>
            <Text style={styles.eventDateTime}>12 Ekim Pazar • 14:00</Text>
            <View style={styles.announcementBadgeInline}>
              <Text style={styles.announcementBadgeInlineText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.eventCardLarge, { backgroundColor: '#8B7355' }]}>
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
          <View style={styles.eventContentLarge}>
            <Text style={styles.eventNameLarge}>Kadıköy Gezisi</Text>
            <Text style={styles.eventDateTime}>17 Ekim Cuma • 10:00</Text>
            <View style={styles.captainBadge}>
              <Text style={styles.captainText}>Bu etkinlikte kaptansın! ⚡</Text>
            </View>
            <View style={styles.announcementBadgeWarningInline}>
              <Text style={styles.announcementBadgeWarningInlineText}>⚠ Duyuru yapılmadı</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.eventCardLarge, { backgroundColor: '#7A8B99' }]}>
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
          <View style={styles.eventContentLarge}>
            <Text style={styles.eventNameLarge}>Teknik Eğitim 102</Text>
            <Text style={styles.eventDateTime}>25 Ekim Cumartesi • 16:00</Text>
            <View style={styles.backupCaptainBadge}>
              <Text style={styles.backupCaptainText}>Yedek kaptansın 🔄</Text>
            </View>
            <View style={styles.announcementBadgeInline}>
              <Text style={styles.announcementBadgeInlineText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.eventCardLarge, { backgroundColor: '#9B8B7E' }]}>
          <View style={styles.imageWrapper}>
            <Image 
              source={require('./assets/placeholder_tanisma_toplantisi.jpg')} 
              style={styles.eventImage}
            />
          </View>
          <LinearGradient
            colors={['#9B8B7E', '#9B8B7E', 'rgba(155,139,126,0.8)', 'rgba(155,139,126,0.6)', 'rgba(155,139,126,0.3)', 'rgba(155,139,126,0)']}
            locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.imageOpacityMask}
          />
          <View style={styles.eventContentLarge}>
            <Text style={styles.eventNameLarge}>Portre Çekimi Workshop</Text>
            <Text style={styles.eventDateTime}>2 Kasım Pazar • 13:00</Text>
            <View style={styles.announcementBadgeInline}>
              <Text style={styles.announcementBadgeInlineText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.eventCardLarge, { backgroundColor: '#5A6B7A' }]}>
          <View style={styles.imageWrapper}>
            <Image 
              source={require('./assets/placeholder_kadikoy_gezisi.jpg')} 
              style={styles.eventImage}
            />
          </View>
          <LinearGradient
            colors={['#5A6B7A', '#5A6B7A', 'rgba(90,107,122,0.8)', 'rgba(90,107,122,0.6)', 'rgba(90,107,122,0.3)', 'rgba(90,107,122,0)']}
            locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.imageOpacityMask}
          />
          <View style={styles.eventContentLarge}>
            <Text style={styles.eventNameLarge}>Gece Fotoğrafçılığı</Text>
            <Text style={styles.eventDateTime}>8 Kasım Cumartesi • 20:00</Text>
            <View style={styles.captainBadge}>
              <Text style={styles.captainText}>Bu etkinlikte kaptansın! ⚡</Text>
            </View>
            <View style={styles.announcementBadgeInline}>
              <Text style={styles.announcementBadgeInlineText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
        </TouchableOpacity>
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

  const renderCalendar = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Takvim</Text>
      
      <View style={styles.calendarPlaceholder}>
        <Text style={styles.calendarPlaceholderText}>📅</Text>
        <Text style={styles.calendarPlaceholderSubtext}>Takvim özelliği yakında eklenecek</Text>
      </View>
    </ScrollView>
  );

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
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigateToPage('messages')}
      >
        <Image source={require('./assets/back.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

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
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigateToPage('messages')}
      >
        <Image source={require('./assets/back.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

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

  const renderEventCreate = () => (
    <ScrollView 
      style={styles.dashboardScrollView}
      contentContainerStyle={styles.dashboardContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigateToPage('events')}
      >
        <Image source={require('./assets/back.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <Text style={styles.pageTitle}>Yeni Etkinlik</Text>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Etkinlik Adı</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Etkinlik adı..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Tarih</Text>
        <TextInput
          style={styles.formInput}
          placeholder="GG/AA/YYYY"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Saat</Text>
        <TextInput
          style={styles.formInput}
          placeholder="SS:DD"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Konum</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Etkinlik konumu..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Açıklama</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          placeholder="Etkinlik açıklaması..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Kaptan</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Kaptan seç..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormSection}>
        <Text style={styles.formLabel}>Yedek Kaptan</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Yedek kaptan seç..."
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.createFormActions}>
        <TouchableOpacity style={styles.attachButton}>
          <Image source={require('./assets/image.png')} style={styles.attachIcon} />
          <Text style={styles.attachButtonText}>Kapak Resmi Ekle</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Etkinliği Oluştur</Text>
      </TouchableOpacity>
    </ScrollView>
  );

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
            <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
              <View style={styles.iconFrame}>
                <Image source={require('./assets/menu.png')} style={styles.icon} />
              </View>
            </TouchableOpacity>

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
  eventContentLarge: {
    position: 'absolute',
    left: 0,
    right: '25%',
    top: 0,
    bottom: 0,
    padding: 15,
    justifyContent: 'center',
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
  // Calendar Placeholder
  calendarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  calendarPlaceholderText: {
    fontSize: 80,
    marginBottom: 20,
  },
  calendarPlaceholderSubtext: {
    fontFamily: 'Inter_18pt-Regular',
    fontSize: 16,
    color: '#999',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
    marginRight: 8,
  },
  backText: {
    fontFamily: 'Inter_18pt-Medium',
    fontSize: 16,
    color: '#007AFF',
  },
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
  formTextArea: {
    height: 120,
    textAlignVertical: 'top',
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
});
