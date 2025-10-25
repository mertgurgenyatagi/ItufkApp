import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity, Dimensions, SafeAreaView, Platform, StatusBar as RNStatusBar, ScrollView } from 'react-native';
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
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, notifications, events, messages, settings
  const [showCaptainOnly, setShowCaptainOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showTaggedOnly, setShowTaggedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
        <TouchableOpacity style={styles.calendarButton}>
          <Text style={styles.calendarButtonText}>Takvime git</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.upcomingEventsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.upcomingEventsTitle}>Yaklaşan Etkinlikler</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateTo('events')}>
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
          <TouchableOpacity style={styles.sectionButton} onPress={() => navigateTo('messages')}>
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
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>💬</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Bir mesajda etiketlendiniz</Text>
            <Text style={styles.notificationTime}>1 saat önce</Text>
          </View>
        </View>
        <Text style={styles.notificationContent}>
          <Text style={styles.notificationBold}>Ahmet</Text> sizi "Ekipman Listesi" başlıklı mesajda etiketledi: "@Mert senin elinde kaç tane tripod var?"
        </Text>
      </View>

      {/* Event Reminder - 5 days */}
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>⚠️</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Etkinlik duyurusu yapılmadı</Text>
            <Text style={styles.notificationTime}>3 saat önce</Text>
          </View>
        </View>
        <Text style={styles.notificationContent}>
          <Text style={styles.notificationBold}>Kadıköy Gezisi</Text> etkinliğine 5 gün kaldı ve duyuru henüz yapılmadı. Kaptanı olduğunuz bu etkinlik için duyuru yapmanız gerekiyor.
        </Text>
      </View>

      {/* Event Reminder - 1 day */}
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Etkinlik yaklaşıyor</Text>
            <Text style={styles.notificationTime}>Dün</Text>
          </View>
        </View>
        <Text style={styles.notificationContent}>
          <Text style={styles.notificationBold}>Tanışma Toplantısı</Text> etkinliğine 1 gün kaldı. Kaptanı olduğunuz bu etkinlik için son hazırlıkları tamamlayın.
        </Text>
      </View>

      {/* Tagged Message Notification 2 */}
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>💬</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Bir mesajda etiketlendiniz</Text>
            <Text style={styles.notificationTime}>2 gün önce</Text>
          </View>
        </View>
        <Text style={styles.notificationContent}>
          <Text style={styles.notificationBold}>Zeynep</Text> sizi "Lightroom Eğitimi" başlıklı mesajda etiketledi: "@Mert eğitim materyallerini paylaşabilir misin?"
        </Text>
      </View>

      {/* Backup Captain Reminder */}
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>Yedek kaptan hatırlatması</Text>
            <Text style={styles.notificationTime}>3 gün önce</Text>
          </View>
        </View>
        <Text style={styles.notificationContent}>
          <Text style={styles.notificationBold}>Teknik Eğitim 102</Text> etkinliğine 1 gün kaldı. Yedek kaptanı olduğunuz bu etkinlikte hazır olmanız gerekiyor.
        </Text>
      </View>
    </ScrollView>
  );

  const renderEvents = () => {
    return (
      <ScrollView 
        style={styles.dashboardScrollView}
        contentContainerStyle={styles.dashboardContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Etkinlikler</Text>
        
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

        {/* Event List */}
        <TouchableOpacity style={styles.eventListItem}>
          <View style={styles.eventListHeader}>
            <Text style={styles.eventListName}>Tanışma Toplantısı</Text>
            <View style={styles.announcementBadge}>
              <Text style={styles.announcementBadgeText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
          <Text style={styles.eventListDate}>12 Ekim 2025, Pazar • 14:00</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventListItem}>
          <View style={styles.eventListHeader}>
            <Text style={styles.eventListName}>Kadıköy Gezisi</Text>
            <View style={styles.captainBadgeSmall}>
              <Text style={styles.captainBadgeSmallText}>Bu etkinlikte kaptansın!</Text>
            </View>
          </View>
          <Text style={styles.eventListDate}>17 Ekim 2025, Cuma • 10:00</Text>
          <View style={styles.announcementBadgeWarning}>
            <Text style={styles.announcementBadgeWarningText}>⚠ Duyuru yapılmadı</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventListItem}>
          <View style={styles.eventListHeader}>
            <Text style={styles.eventListName}>Teknik Eğitim 102</Text>
            <View style={styles.announcementBadge}>
              <Text style={styles.announcementBadgeText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
          <Text style={styles.eventListDate}>25 Ekim 2025, Cumartesi • 16:00</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventListItem}>
          <View style={styles.eventListHeader}>
            <Text style={styles.eventListName}>Portre Çekimi Workshop</Text>
            <View style={styles.announcementBadge}>
              <Text style={styles.announcementBadgeText}>✓ Duyuru yapıldı</Text>
            </View>
          </View>
          <Text style={styles.eventListDate}>2 Kasım 2025, Pazar • 13:00</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.eventListItem}>
          <View style={styles.eventListHeader}>
            <Text style={styles.eventListName}>Gece Fotoğrafçılığı</Text>
            <View style={styles.captainBadgeSmall}>
              <Text style={styles.captainBadgeSmallText}>Bu etkinlikte kaptansın!</Text>
            </View>
          </View>
          <Text style={styles.eventListDate}>8 Kasım 2025, Cumartesi • 20:00</Text>
          <View style={styles.announcementBadge}>
            <Text style={styles.announcementBadgeText}>✓ Duyuru yapıldı</Text>
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
        <Text style={styles.pageTitle}>Mesaj Panosu</Text>
        
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
        <View style={styles.messageCard}>
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
        </View>

        {/* Read Message */}
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

        {/* Unread Tagged Message */}
        <View style={styles.messageCard}>
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
        </View>

        {/* Read Message */}
        <View style={styles.messageCard}>
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
        </View>

        {/* Unread Message */}
        <View style={styles.messageCard}>
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
        </View>
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
              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/search.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.iconFrame}>
                  <Image source={require('./assets/notifications.png')} style={styles.icon} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Page Content */}
          {renderPageContent()}

          <StatusBar style="dark" />
        </Animated.View>
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
});
