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
            <TouchableOpacity style={styles.menuItem}>
              <Image source={require('./assets/dashboard.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Ana ekran</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Image source={require('./assets/notifications.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Bildirimler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Image source={require('./assets/events.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Etkinlikler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Image source={require('./assets/message_board.png')} style={styles.menuIcon} />
              <Text style={styles.menuItemText}>Mesaj Panosu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
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

          {/* Dashboard Content */}
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
                <TouchableOpacity style={styles.sectionButton}>
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
                <TouchableOpacity style={styles.sectionButton}>
                  <Text style={styles.sectionButtonText}>Mesaj panosuna git</Text>
                </TouchableOpacity>
              </View>
              
              {/* Message 1 */}
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

              {/* Message 2 */}
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

              {/* Message 3 */}
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
});
