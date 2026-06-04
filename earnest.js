const ComponentFunction = function() {
  // @section:imports @depends:[]
  const React = require('react');
  const { useState, useEffect, useContext, useMemo, useCallback } = React;
  const { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView, FlatList, Dimensions } = require('react-native');
  const { MaterialIcons } = require('@expo/vector-icons');
  const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
  const { useSafeAreaInsets } = require('react-native-safe-area-context');
  const { useQuery, useMutation } = require('platform-hooks');
  // @end:imports

  // @section:theme @depends:[]
  const primaryColor = '#1E40AF';
  const accentColor = '#3B82F6';
  const backgroundColor = '#F1F5F9';
  const cardColor = '#FFFFFF';
  const textPrimary = '#0F172A';
  const textSecondary = '#64748B';
  const designStyle = 'professional';
  const storageStrategy = 'all-local';

  var TAB_MENU_HEIGHT = Platform.OS === 'web' ? 56 : 49;
  var SCROLL_EXTRA_PADDING = 16;
  var WEB_TAB_MENU_PADDING = 90;
  var FAB_SPACING = 16;
  var HEADER_HEIGHT = 64;

  var CATEGORY_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F43F5E', '#A855F7'
  ];
  // @end:theme

  // @section:navigation-setup @depends:[]
  var Tab = createBottomTabNavigator();
  // @end:navigation-setup

  // @section:ThemeContext @depends:[theme]
  const ThemeContext = React.createContext({
    theme: {
      colors: {
        primary: primaryColor, accent: accentColor, background: backgroundColor,
        card: cardColor, textPrimary: textPrimary, textSecondary: textSecondary,
        border: '#E2E8F0', success: '#10B981', error: '#EF4444', warning: '#F59E0B'
      }
    }
  });
  const ThemeProvider = function(props) {
    var lightTheme = useMemo(function() {
      return {
        colors: {
          primary: primaryColor, accent: accentColor, background: backgroundColor,
          card: cardColor, textPrimary: textPrimary, textSecondary: textSecondary,
          border: '#E2E8F0', success: '#10B981', error: '#EF4444', warning: '#F59E0B'
        }
      };
    }, []);
    var value = useMemo(function() { return { theme: lightTheme }; }, [lightTheme]);
    return React.createElement(ThemeContext.Provider, { value: value }, props.children);
  };
  var useTheme = function() { return useContext(ThemeContext); };
  // @end:ThemeContext

  // @section:helpers @depends:[theme]
  var formatCurrency = function(amount) {
    var num = parseFloat(amount) || 0;
    return '$' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  var formatDate = function(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var m = parseInt(parts[1], 10) - 1;
    return months[m] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  };
  var getTodayStr = function() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    return y + '-' + (m < 10 ? '0' + m : String(m)) + '-' + (d < 10 ? '0' + d : String(d));
  };
  var generateId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  // @end:helpers

  // @section:DatePickerInput @depends:[helpers]
  var DatePickerInput = function(props) {
    var parsed = props.value ? props.value.split('-') : null;
    var nowYear = new Date().getFullYear();
    var nowMonth = new Date().getMonth() + 1;
    var nowDay = new Date().getDate();
    var initYear = parsed ? parseInt(parsed[0], 10) : nowYear;
    var initMonth = parsed ? parseInt(parsed[1], 10) : nowMonth;
    var initDay = parsed ? parseInt(parsed[2], 10) : nowDay;

    var showState = useState(false);
    var showPicker = showState[0]; var setShow = showState[1];
    var yearState = useState(initYear);
    var selYear = yearState[0]; var setSelYear = yearState[1];
    var monthState = useState(initMonth);
    var selMonth = monthState[0]; var setSelMonth = monthState[1];
    var dayState = useState(initDay);
    var selDay = dayState[0]; var setSelDay = dayState[1];

    useEffect(function() {
      var maxDay = new Date(selYear, selMonth, 0).getDate();
      if (selDay > maxDay) { setSelDay(maxDay); }
    }, [selYear, selMonth]);

    var pad = function(n) { return n < 10 ? '0' + n : String(n); };
    var handleConfirm = function() {
      if (props.onChange) { props.onChange(selYear + '-' + pad(selMonth) + '-' + pad(selDay)); }
      setShow(false);
    };
    var displayValue = props.value
      ? (pad(selMonth) + '/' + pad(selDay) + '/' + selYear)
      : (props.placeholder || 'Select date');

    if (Platform.OS === 'web') {
      return React.createElement('input', {
        type: 'date',
        value: props.value || '',
        onChange: function(e) { if (props.onChange) { props.onChange(e.target.value); } },
        style: Object.assign({}, {
          padding: 12, border: '1.5px solid #CBD5E1', borderRadius: 8,
          fontSize: 15, width: '100%', boxSizing: 'border-box', color: '#1F2937',
          backgroundColor: '#F8FAFC', outline: 'none', fontFamily: 'inherit'
        }, props.style)
      });
    }

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var years = [];
    for (var y = nowYear - 5; y <= nowYear + 2; y++) { years.push(y); }
    var daysInMonth = new Date(selYear, selMonth, 0).getDate();
    var days = [];
    for (var dd = 1; dd <= daysInMonth; dd++) { days.push(dd); }

    var colStyle = { flex: 1, maxHeight: 180 };
    var itemStyle = function(active) {
      return { paddingVertical: 10, alignItems: 'center', backgroundColor: active ? '#EFF6FF' : 'transparent' };
    };
    var itemTextStyle = function(active) {
      return { fontSize: 15, color: active ? primaryColor : textPrimary, fontWeight: active ? 'bold' : 'normal' };
    };

    return React.createElement(View, { componentId: props.componentId || 'date-picker-input' },
      React.createElement(TouchableOpacity, {
        onPress: function() { setShow(true); },
        style: {
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 8,
          paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#F8FAFC'
        }
      },
        React.createElement(Text, { style: { fontSize: 15, color: props.value ? textPrimary : textSecondary } }, displayValue),
        React.createElement(MaterialIcons, { name: 'calendar-today', size: 18, color: textSecondary })
      ),
      React.createElement(Modal, { visible: showPicker, transparent: true, animationType: 'slide', onRequestClose: function() { setShow(false); } },
        React.createElement(View, { style: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' } },
          React.createElement(View, { style: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 } },
            React.createElement(Text, { style: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: textPrimary } }, 'Select Date'),
            React.createElement(View, { style: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden' } },
              React.createElement(ScrollView, { style: colStyle, showsVerticalScrollIndicator: false },
                MONTHS.map(function(m, i) {
                  var active = selMonth === i + 1;
                  return React.createElement(TouchableOpacity, { key: String(i), onPress: function() { setSelMonth(i + 1); }, style: itemStyle(active) },
                    React.createElement(Text, { style: itemTextStyle(active) }, m));
                })
              ),
              React.createElement(ScrollView, { style: colStyle, showsVerticalScrollIndicator: false },
                days.map(function(d) {
                  var active = selDay === d;
                  return React.createElement(TouchableOpacity, { key: String(d), onPress: function() { setSelDay(d); }, style: itemStyle(active) },
                    React.createElement(Text, { style: itemTextStyle(active) }, String(d)));
                })
              ),
              React.createElement(ScrollView, { style: colStyle, showsVerticalScrollIndicator: false },
                years.map(function(yr) {
                  var active = selYear === yr;
                  return React.createElement(TouchableOpacity, { key: String(yr), onPress: function() { setSelYear(yr); }, style: itemStyle(active) },
                    React.createElement(Text, { style: itemTextStyle(active) }, String(yr)));
                })
              )
            ),
            React.createElement(TouchableOpacity, { onPress: handleConfirm, style: { backgroundColor: primaryColor, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 } },
              React.createElement(Text, { style: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' } }, 'Confirm')
            ),
            React.createElement(TouchableOpacity, { onPress: function() { setShow(false); }, style: { padding: 14, alignItems: 'center', marginTop: 4 } },
              React.createElement(Text, { style: { color: textSecondary, fontSize: 16 } }, 'Cancel')
            )
          )
        )
      )
    );
  };
  // @end:DatePickerInput

  // @section:AddTransactionModal @depends:[helpers,DatePickerInput]
  var AddTransactionModal = function(props) {
    var visible = props.visible;
    var onClose = props.onClose;
    var onSave = props.onSave;
    var categories = props.categories;
    var insetsTop = props.insetsTop;
    var insetsBottom = props.insetsBottom;

    var amountState = useState('');
    var amount = amountState[0]; var setAmount = amountState[1];
    var descState = useState('');
    var description = descState[0]; var setDescription = descState[1];
    var dateState = useState(getTodayStr());
    var txDate = dateState[0]; var setTxDate = dateState[1];
    var catState = useState('');
    var selectedCatId = catState[0]; var setSelectedCatId = catState[1];

    var sheetHeight = Math.round(Dimensions.get('window').height * 0.88);

    useEffect(function() {
      if (visible) {
        setAmount('');
        setDescription('');
        setTxDate(getTodayStr());
        setSelectedCatId(categories && categories.length > 0 ? categories[0].id : '');
      }
    }, [visible]);

    useEffect(function() {
      if (categories && categories.length > 0 && !selectedCatId) {
        setSelectedCatId(categories[0].id);
      }
    }, [categories]);

    var handleSave = function() {
      var numAmount = parseFloat(amount);
      if (!amount || isNaN(numAmount) || numAmount <= 0) {
        Platform.OS === 'web' ? window.alert('Please enter a valid amount.') : Alert.alert('Validation', 'Please enter a valid amount.');
        return;
      }
      if (!txDate) {
        Platform.OS === 'web' ? window.alert('Please select a date.') : Alert.alert('Validation', 'Please select a date.');
        return;
      }
      if (!selectedCatId) {
        Platform.OS === 'web' ? window.alert('Please select a category.') : Alert.alert('Validation', 'Please select a category.');
        return;
      }
      onSave({ amount: numAmount, transaction_date: txDate, description: description.trim(), category_id: selectedCatId });
    };

    return React.createElement(Modal, { visible: visible, transparent: true, animationType: 'slide', onRequestClose: onClose },
      React.createElement(View, { style: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }, componentId: 'add-tx-overlay' },
        React.createElement(View, { style: { height: sheetHeight, backgroundColor: cardColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insetsBottom + 16 }, componentId: 'add-tx-content' },
          React.createElement(View, { style: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
            React.createElement(Text, { style: { fontSize: 18, fontWeight: '700', color: textPrimary } }, 'Add Transaction'),
            React.createElement(TouchableOpacity, { onPress: onClose, componentId: 'add-tx-close-btn', style: { padding: 4 } },
              React.createElement(MaterialIcons, { name: 'close', size: 24, color: textSecondary })
            )
          ),
          React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 20 }, keyboardShouldPersistTaps: 'handled' },
            React.createElement(Text, { style: styles.inputLabel }, 'Amount *'),
            React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 8, backgroundColor: '#F8FAFC', marginBottom: 16 } },
              React.createElement(Text, { style: { fontSize: 20, fontWeight: 'bold', color: textSecondary, paddingLeft: 12 } }, '$'),
              React.createElement(TextInput, {
                value: amount,
                onChangeText: function(text) {
                  var sanitised = text.replace(/[^0-9.]/g, '');
                  var parts = sanitised.split('.');
                  if (parts.length > 2) { sanitised = parts[0] + '.' + parts.slice(1).join(''); }
                  setAmount(sanitised);
                },
                placeholder: '0.00',
                placeholderTextColor: '#94A3B8',
                keyboardType: 'decimal-pad',
                style: { flex: 1, fontSize: 20, fontWeight: 'bold', color: textPrimary, padding: 12 },
                componentId: 'input-amount'
              })
            ),
            React.createElement(Text, { style: styles.inputLabel }, 'Date *'),
            React.createElement(View, { style: { marginBottom: 16 } },
              React.createElement(DatePickerInput, { value: txDate, onChange: setTxDate, placeholder: 'Select date', componentId: 'input-tx-date' })
            ),
            React.createElement(Text, { style: styles.inputLabel }, 'Category *'),
            categories && categories.length > 0
              ? React.createElement(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, style: { flexGrow: 'initial', marginBottom: 16 }, contentContainerStyle: { paddingRight: 8 } },
                  categories.map(function(cat) {
                    var isSelected = selectedCatId === cat.id;
                    return React.createElement(TouchableOpacity, {
                      key: cat.id,
                      onPress: function() { setSelectedCatId(cat.id); },
                      style: {
                        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8,
                        borderRadius: 20, marginRight: 8,
                        backgroundColor: isSelected ? (cat.color || accentColor) : '#F1F5F9',
                        borderWidth: 1.5, borderColor: isSelected ? (cat.color || accentColor) : '#E2E8F0'
                      },
                      componentId: 'cat-chip-' + cat.id
                    },
                      React.createElement(View, { style: { width: 8, height: 8, borderRadius: 4, backgroundColor: cat.color || accentColor, marginRight: 6 } }),
                      React.createElement(Text, { style: { fontSize: 13, fontWeight: '600', color: isSelected ? '#FFFFFF' : textPrimary } }, cat.name)
                    );
                  })
                )
              : React.createElement(View, { style: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 12, marginBottom: 16 } },
                  React.createElement(Text, { style: { color: '#92400E', fontSize: 13 } }, 'No categories yet. Create one in the Categories tab first.')
                ),
            React.createElement(Text, { style: styles.inputLabel }, 'Description (optional)'),
            React.createElement(TextInput, {
              value: description,
              onChangeText: setDescription,
              placeholder: 'What did you spend on?',
              placeholderTextColor: '#94A3B8',
              multiline: true,
              numberOfLines: 3,
              textAlignVertical: 'top',
              style: styles.textArea,
              componentId: 'input-description'
            })
          ),
          React.createElement(View, { style: { paddingHorizontal: 20, paddingTop: 12 } },
            React.createElement(TouchableOpacity, {
              onPress: handleSave,
              style: [styles.primaryBtn, { opacity: (!amount || !selectedCatId) ? 0.6 : 1 }],
              componentId: 'save-transaction-btn'
            },
              React.createElement(MaterialIcons, { name: 'add', size: 20, color: '#FFFFFF' }),
              React.createElement(Text, { style: styles.primaryBtnText }, 'Save Transaction')
            )
          )
        )
      )
    );
  };
  // @end:AddTransactionModal

  // @section:AddCategoryModal @depends:[helpers]
  var AddCategoryModal = function(props) {
    var visible = props.visible;
    var onClose = props.onClose;
    var onSave = props.onSave;
    var insetsBottom = props.insetsBottom;

    var nameState = useState('');
    var catName = nameState[0]; var setCatName = nameState[1];
    var colorState = useState(CATEGORY_COLORS[0]);
    var selectedColor = colorState[0]; var setSelectedColor = colorState[1];
    var sheetHeight = Math.round(Dimensions.get('window').height * 0.65);

    useEffect(function() {
      if (visible) { setCatName(''); setSelectedColor(CATEGORY_COLORS[0]); }
    }, [visible]);

    var handleSave = function() {
      if (!catName.trim()) {
        Platform.OS === 'web' ? window.alert('Please enter a category name.') : Alert.alert('Validation', 'Please enter a category name.');
        return;
      }
      onSave({ name: catName.trim(), color: selectedColor });
    };

    return React.createElement(Modal, { visible: visible, transparent: true, animationType: 'slide', onRequestClose: onClose },
      React.createElement(View, { style: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }, componentId: 'add-cat-overlay' },
        React.createElement(View, { style: { height: sheetHeight, backgroundColor: cardColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insetsBottom + 16, padding: 20 }, componentId: 'add-cat-content' },
          React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 } },
            React.createElement(Text, { style: { fontSize: 18, fontWeight: '700', color: textPrimary } }, 'New Category'),
            React.createElement(TouchableOpacity, { onPress: onClose, componentId: 'add-cat-close-btn', style: { padding: 4 } },
              React.createElement(MaterialIcons, { name: 'close', size: 24, color: textSecondary })
            )
          ),
          React.createElement(Text, { style: styles.inputLabel }, 'Category Name *'),
          React.createElement(TextInput, {
            value: catName,
            onChangeText: setCatName,
            placeholder: 'e.g. Food & Dining',
            placeholderTextColor: '#94A3B8',
            autoCapitalize: 'words',
            style: styles.textInput,
            componentId: 'input-cat-name'
          }),
          React.createElement(Text, { style: [styles.inputLabel, { marginTop: 16 }] }, 'Color'),
          React.createElement(View, { style: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 } },
            CATEGORY_COLORS.map(function(color) {
              var isSelected = selectedColor === color;
              return React.createElement(TouchableOpacity, {
                key: color,
                onPress: function() { setSelectedColor(color); },
                style: { width: 40, height: 40, borderRadius: 20, backgroundColor: color, margin: 6, alignItems: 'center', justifyContent: 'center', borderWidth: isSelected ? 3 : 0, borderColor: '#FFFFFF', shadowColor: isSelected ? color : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: isSelected ? 4 : 0 },
                componentId: 'color-chip-' + color
              },
                isSelected ? React.createElement(MaterialIcons, { name: 'check', size: 18, color: '#FFFFFF' }) : null
              );
            })
          ),
          React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' } },
            React.createElement(View, { style: { width: 36, height: 36, borderRadius: 18, backgroundColor: selectedColor, marginRight: 12 } }),
            React.createElement(Text, { style: { fontSize: 15, fontWeight: '600', color: textPrimary } }, catName || 'Preview Name')
          ),
          React.createElement(TouchableOpacity, {
            onPress: handleSave,
            style: [styles.primaryBtn, { opacity: !catName.trim() ? 0.6 : 1 }],
            componentId: 'save-category-btn'
          },
            React.createElement(MaterialIcons, { name: 'add', size: 20, color: '#FFFFFF' }),
            React.createElement(Text, { style: styles.primaryBtnText }, 'Create Category')
          )
        )
      )
    );
  };
  // @end:AddCategoryModal

  // @section:CategoryTransactionsModal @depends:[helpers]
  var CategoryTransactionsModal = function(props) {
    var visible = props.visible;
    var onClose = props.onClose;
    var category = props.category;
    var transactions = props.transactions;
    var insetsTop = props.insetsTop;
    var insetsBottom = props.insetsBottom;
    var onDeleteTransaction = props.onDeleteTransaction;
    var sheetHeight = Math.round(Dimensions.get('window').height * 0.82);

    if (!category) return null;

    var filtered = useMemo(function() {
      if (!transactions) return [];
      return transactions.filter(function(t) { return t.category_id === category.id; }).sort(function(a, b) {
        return b.transaction_date > a.transaction_date ? 1 : -1;
      });
    }, [transactions, category]);

    var total = useMemo(function() {
      return filtered.reduce(function(sum, t) { return sum + (parseFloat(t.amount) || 0); }, 0);
    }, [filtered]);

    var handleDelete = function(txId) {
      var doDelete = function() { onDeleteTransaction(txId); };
      if (Platform.OS === 'web') {
        if (window.confirm('Delete this transaction?')) doDelete();
      } else {
        Alert.alert('Delete Transaction', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete }
        ]);
      }
    };

    return React.createElement(Modal, { visible: visible, transparent: true, animationType: 'slide', onRequestClose: onClose },
      React.createElement(View, { style: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }, componentId: 'cat-detail-overlay' },
        React.createElement(View, { style: { height: sheetHeight, backgroundColor: backgroundColor, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, componentId: 'cat-detail-content' },
          React.createElement(View, { style: { backgroundColor: category.color || accentColor, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 24 } },
            React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
              React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
                React.createElement(View, { style: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 10 } },
                  React.createElement(MaterialIcons, { name: 'label', size: 20, color: '#FFFFFF' })
                ),
                React.createElement(Text, { style: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' } }, category.name)
              ),
              React.createElement(TouchableOpacity, { onPress: onClose, style: { padding: 4 }, componentId: 'cat-detail-close-btn' },
                React.createElement(MaterialIcons, { name: 'close', size: 24, color: '#FFFFFF' })
              )
            ),
            React.createElement(Text, { style: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' } }, formatCurrency(total)),
            React.createElement(Text, { style: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 } }, String(filtered.length) + ' transaction' + (filtered.length !== 1 ? 's' : ''))
          ),
          filtered.length === 0
            ? React.createElement(View, { style: { flex: 1, alignItems: 'center', justifyContent: 'center' },
                componentId: 'cat-detail-empty' },
                React.createElement(MaterialIcons, { name: 'receipt-long', size: 56, color: '#CBD5E1' }),
                React.createElement(Text, { style: { color: textSecondary, fontSize: 16, marginTop: 12 } }, 'No transactions yet')
              )
            : React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 16, paddingBottom: insetsBottom + 16 } },
                filtered.map(function(tx) {
                  return React.createElement(View, { key: tx.id, style: styles.txCard, componentId: 'cat-detail-tx-' + tx.id },
                    React.createElement(View, { style: { flex: 1 } },
                      React.createElement(Text, { style: { fontSize: 15, fontWeight: '600', color: textPrimary } }, tx.description || 'Transaction'),
                      React.createElement(Text, { style: { fontSize: 12, color: textSecondary, marginTop: 2 } }, formatDate(tx.transaction_date))
                    ),
                    React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
                      React.createElement(Text, { style: { fontSize: 16, fontWeight: '700', color: textPrimary, marginRight: 8 } }, formatCurrency(tx.amount)),
                      React.createElement(TouchableOpacity, {
                        onPress: function() { handleDelete(tx.id); },
                        style: { padding: 4 },
                        componentId: 'delete-tx-btn-' + tx.id
                      },
                        React.createElement(MaterialIcons, { name: 'delete-outline', size: 20, color: '#EF4444' })
                      )
                    )
                  );
                })
              )
        )
      )
    );
  };
  // @end:CategoryTransactionsModal

  // @section:TransactionsScreen-state @depends:[ThemeContext]
  var useTransactionsState = function() {
    var themeCtx = useTheme();
    var theme = themeCtx.theme;
    var categoriesQuery = useQuery('categories');
    var transactionsQuery = useQuery('transactions', {}, { column: 'transaction_date', ascending: false });
    var showAddModalState = useState(false);
    var showAddCatModalState = useState(false);
    return {
      theme: theme,
      categories: categoriesQuery.data || [],
      catLoading: categoriesQuery.loading,
      refetchCats: categoriesQuery.refetch,
      transactions: transactionsQuery.data || [],
      txLoading: transactionsQuery.loading,
      refetchTx: transactionsQuery.refetch,
      showAddModal: showAddModalState[0], setShowAddModal: showAddModalState[1],
      showAddCatModal: showAddCatModalState[0], setShowAddCatModal: showAddCatModalState[1]
    };
  };
  // @end:TransactionsScreen-state

  // @section:TransactionsScreen @depends:[TransactionsScreen-state,AddTransactionModal,AddCategoryModal,helpers,styles]
  var TransactionsScreen = function(props) {
    var state = useTransactionsState();
    var insets = useSafeAreaInsets();
    var insertTx = useMutation('transactions', 'insert');
    var insertTxMutate = insertTx.mutate;
    var insertCat = useMutation('categories', 'insert');
    var insertCatMutate = insertCat.mutate;
    var deleteTxMutation = useMutation('transactions', 'delete');
    var deleteTxMutate = deleteTxMutation.mutate;

    var fabBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + FAB_SPACING);
    var scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING + 60);

    var catMap = useMemo(function() {
      var map = {};
      (state.categories || []).forEach(function(c) { map[c.id] = c; });
      return map;
    }, [state.categories]);

    var handleSaveTx = function(data) {
      insertTxMutate({ id: generateId(), amount: data.amount, transaction_date: data.transaction_date, description: data.description, category_id: data.category_id })
        .then(function() {
          state.refetchTx();
          state.setShowAddModal(false);
          Platform.OS === 'web' ? window.alert('Transaction saved!') : Alert.alert('Saved', 'Transaction added successfully.');
        })
        .catch(function(err) {
          Platform.OS === 'web' ? window.alert('Error: ' + err.message) : Alert.alert('Error', err.message);
        });
    };

    var handleSaveCat = function(data) {
      insertCatMutate({ id: generateId(), name: data.name, color: data.color })
        .then(function() {
          state.refetchCats();
          state.setShowAddCatModal(false);
        })
        .catch(function(err) {
          Platform.OS === 'web' ? window.alert('Error: ' + err.message) : Alert.alert('Error', err.message);
        });
    };

    var handleDeleteTx = function(txId) {
      deleteTxMutate({ id: txId })
        .then(function() { state.refetchTx(); })
        .catch(function(err) {
          Platform.OS === 'web' ? window.alert('Error: ' + err.message) : Alert.alert('Error', err.message);
        });
    };

    var groupedByDate = useMemo(function() {
      var groups = [];
      var dateMap = {};
      (state.transactions || []).forEach(function(tx) {
        var d = tx.transaction_date || 'Unknown';
        if (!dateMap[d]) { dateMap[d] = []; groups.push(d); }
        dateMap[d].push(tx);
      });
      return groups.map(function(d) { return { date: d, items: dateMap[d] }; });
    }, [state.transactions]);

    var totalThisMonth = useMemo(function() {
      var now = new Date();
      var ym = now.getFullYear() + '-' + (now.getMonth() + 1 < 10 ? '0' : '') + String(now.getMonth() + 1);
      return (state.transactions || []).filter(function(t) { return t.transaction_date && t.transaction_date.startsWith(ym); })
        .reduce(function(sum, t) { return sum + (parseFloat(t.amount) || 0); }, 0);
    }, [state.transactions]);

    if (state.txLoading) {
      return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor, alignItems: 'center', justifyContent: 'center' }, componentId: 'tx-loading' },
        React.createElement(ActivityIndicator, { size: 'large', color: primaryColor })
      );
    }

    return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor }, componentId: 'transactions-screen' },
      React.createElement(View, { style: [styles.screenHeader, { paddingTop: insets.top + 12 }] },
        React.createElement(Text, { style: styles.screenTitle, componentId: 'tx-screen-title' }, 'Transactions'),
        React.createElement(TouchableOpacity, { onPress: function() { state.setShowAddCatModal(true); }, style: { padding: 8 }, componentId: 'tx-add-cat-btn' },
          React.createElement(MaterialIcons, { name: 'label', size: 24, color: '#FFFFFF' })
        )
      ),
      React.createElement(View, { style: styles.monthSummaryCard, componentId: 'tx-month-summary' },
        React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } },
          React.createElement(View, null,
            React.createElement(Text, { style: { fontSize: 13, color: textSecondary, fontWeight: '500' } }, 'This Month'),
            React.createElement(Text, { style: { fontSize: 28, fontWeight: '800', color: textPrimary, marginTop: 2 } }, formatCurrency(totalThisMonth))
          ),
          React.createElement(View, { style: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' } },
            React.createElement(MaterialIcons, { name: 'account-balance-wallet', size: 28, color: primaryColor })
          )
        )
      ),
      React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: scrollBottomPadding }, showsVerticalScrollIndicator: false },
        state.categories.length === 0
          ? React.createElement(View, { style: styles.emptyState, componentId: 'tx-empty-cats' },
              React.createElement(MaterialIcons, { name: 'label-off', size: 64, color: '#CBD5E1' }),
              React.createElement(Text, { style: styles.emptyTitle }, 'No Categories Yet'),
              React.createElement(Text, { style: styles.emptySubtitle }, 'Create categories first to start logging transactions.'),
              React.createElement(TouchableOpacity, { onPress: function() { state.setShowAddCatModal(true); }, style: [styles.primaryBtn, { marginTop: 20 }], componentId: 'empty-add-cat-btn' },
                React.createElement(MaterialIcons, { name: 'add', size: 20, color: '#FFFFFF' }),
                React.createElement(Text, { style: styles.primaryBtnText }, 'Add Category')
              )
            )
          : state.transactions.length === 0
          ? React.createElement(View, { style: styles.emptyState, componentId: 'tx-empty' },
              React.createElement(MaterialIcons, { name: 'receipt-long', size: 64, color: '#CBD5E1' }),
              React.createElement(Text, { style: styles.emptyTitle }, 'No Transactions'),
              React.createElement(Text, { style: styles.emptySubtitle }, 'Tap the + button to log your first expense.')
            )
          : groupedByDate.map(function(group) {
              var dayTotal = group.items.reduce(function(s, t) { return s + (parseFloat(t.amount) || 0); }, 0);
              return React.createElement(View, { key: group.date, componentId: 'tx-group-' + group.date },
                React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 16 } },
                  React.createElement(Text, { style: { fontSize: 13, fontWeight: '600', color: textSecondary } }, formatDate(group.date)),
                  React.createElement(Text, { style: { fontSize: 13, fontWeight: '700', color: textPrimary } }, formatCurrency(dayTotal))
                ),
                group.items.map(function(tx) {
                  var cat = catMap[tx.category_id];
                  return React.createElement(View, { key: tx.id, style: styles.txCard, componentId: 'tx-item-' + tx.id },
                    React.createElement(View, { style: { width: 42, height: 42, borderRadius: 21, backgroundColor: cat ? (cat.color + '22') : '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 } },
                      React.createElement(View, { style: { width: 16, height: 16, borderRadius: 8, backgroundColor: cat ? cat.color : '#94A3B8' } })
                    ),
                    React.createElement(View, { style: { flex: 1 } },
                      React.createElement(Text, { style: { fontSize: 15, fontWeight: '600', color: textPrimary } }, tx.description || (cat ? cat.name : 'Transaction')),
                      React.createElement(Text, { style: { fontSize: 12, color: textSecondary, marginTop: 2 } }, cat ? cat.name : 'Unknown Category')
                    ),
                    React.createElement(View, { style: { alignItems: 'flex-end' } },
                      React.createElement(Text, { style: { fontSize: 16, fontWeight: '700', color: textPrimary } }, formatCurrency(tx.amount)),
                      React.createElement(TouchableOpacity, {
                        onPress: function() {
                          var doDelete = function() {
                            deleteTxMutate({ id: tx.id }).then(function() { state.refetchTx(); }).catch(function(err) {
                              Platform.OS === 'web' ? window.alert(err.message) : Alert.alert('Error', err.message);
                            });
                          };
                          if (Platform.OS === 'web') {
                            if (window.confirm('Delete this transaction?')) doDelete();
                          } else {
                            Alert.alert('Delete', 'Remove this transaction?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: doDelete }]);
                          }
                        },
                        style: { padding: 4, marginTop: 2 },
                        componentId: 'delete-tx-inline-' + tx.id
                      },
                        React.createElement(MaterialIcons, { name: 'delete-outline', size: 16, color: '#CBD5E1' })
                      )
                    )
                  );
                })
              );
            })
      ),
      React.createElement(TouchableOpacity, {
        onPress: function() { state.setShowAddModal(true); },
        style: [styles.fab, { bottom: fabBottom, backgroundColor: primaryColor }],
        componentId: 'add-tx-fab'
      },
        React.createElement(MaterialIcons, { name: 'add', size: 28, color: '#FFFFFF' })
      ),
      React.createElement(AddTransactionModal, { visible: state.showAddModal, onClose: function() { state.setShowAddModal(false); }, onSave: handleSaveTx, categories: state.categories, insetsTop: insets.top, insetsBottom: insets.bottom }),
      React.createElement(AddCategoryModal, { visible: state.showAddCatModal, onClose: function() { state.setShowAddCatModal(false); }, onSave: handleSaveCat, insetsBottom: insets.bottom })
    );
  };
  // @end:TransactionsScreen

  // @section:SummaryScreen-state @depends:[ThemeContext]
  var useSummaryState = function() {
    var themeCtx = useTheme();
    var theme = themeCtx.theme;
    var categoriesQuery = useQuery('categories');
    var transactionsQuery = useQuery('transactions');
    var selectedCatState = useState(null);
    return {
      theme: theme,
      categories: categoriesQuery.data || [],
      transactions: transactionsQuery.data || [],
      loading: categoriesQuery.loading || transactionsQuery.loading,
      refetchTx: transactionsQuery.refetch,
      selectedCat: selectedCatState[0], setSelectedCat: selectedCatState[1]
    };
  };
  // @end:SummaryScreen-state

  // @section:SummaryScreen @depends:[SummaryScreen-state,CategoryTransactionsModal,helpers,styles]
  var SummaryScreen = function(props) {
    var state = useSummaryState();
    var insets = useSafeAreaInsets();
    var deleteTxMutation = useMutation('transactions', 'delete');
    var deleteTxMutate = deleteTxMutation.mutate;
    var scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING);

    var summaryData = useMemo(function() {
      var totals = {};
      (state.transactions || []).forEach(function(tx) {
        var cid = tx.category_id;
        if (!totals[cid]) totals[cid] = 0;
        totals[cid] += parseFloat(tx.amount) || 0;
      });
      return (state.categories || []).map(function(cat) {
        return { category: cat, total: totals[cat.id] || 0, count: (state.transactions || []).filter(function(t) { return t.category_id === cat.id; }).length };
      }).filter(function(item) { return item.total > 0; }).sort(function(a, b) { return b.total - a.total; });
    }, [state.transactions, state.categories]);

    var grandTotal = useMemo(function() {
      return summaryData.reduce(function(s, item) { return s + item.total; }, 0);
    }, [summaryData]);

    var handleDeleteTx = function(txId) {
      deleteTxMutate({ id: txId })
        .then(function() { state.refetchTx(); })
        .catch(function(err) {
          Platform.OS === 'web' ? window.alert(err.message) : Alert.alert('Error', err.message);
        });
    };

    if (state.loading) {
      return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor, alignItems: 'center', justifyContent: 'center' }, componentId: 'summary-loading' },
        React.createElement(ActivityIndicator, { size: 'large', color: primaryColor })
      );
    }

    return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor }, componentId: 'summary-screen' },
      React.createElement(View, { style: [styles.screenHeader, { paddingTop: insets.top + 12 }] },
        React.createElement(Text, { style: styles.screenTitle, componentId: 'summary-title' }, 'Spending Summary')
      ),
      React.createElement(View, { style: [styles.totalBanner, { marginHorizontal: 16, marginTop: 12 }], componentId: 'summary-total-banner' },
        React.createElement(View, { style: { alignItems: 'center' } },
          React.createElement(Text, { style: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' } }, 'Total Spending'),
          React.createElement(Text, { style: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', marginTop: 4 } }, formatCurrency(grandTotal))
        ),
        React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 } },
          React.createElement(View, { style: { alignItems: 'center', marginHorizontal: 16 } },
            React.createElement(Text, { style: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' } }, String(state.transactions.length)),
            React.createElement(Text, { style: { fontSize: 12, color: 'rgba(255,255,255,0.7)' } }, 'Transactions')
          ),
          React.createElement(View, { style: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' } }),
          React.createElement(View, { style: { alignItems: 'center', marginHorizontal: 16 } },
            React.createElement(Text, { style: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' } }, String(summaryData.length)),
            React.createElement(Text, { style: { fontSize: 12, color: 'rgba(255,255,255,0.7)' } }, 'Categories')
          )
        )
      ),
      summaryData.length === 0
        ? React.createElement(View, { style: [styles.emptyState, { marginTop: 40 }], componentId: 'summary-empty' },
            React.createElement(MaterialIcons, { name: 'pie-chart-outline', size: 64, color: '#CBD5E1' }),
            React.createElement(Text, { style: styles.emptyTitle }, 'No Spending Data'),
            React.createElement(Text, { style: styles.emptySubtitle }, 'Add transactions to see your spending breakdown.')
          )
        : React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { padding: 16, paddingBottom: scrollBottomPadding }, showsVerticalScrollIndicator: false },
            React.createElement(Text, { style: { fontSize: 14, fontWeight: '600', color: textSecondary, marginBottom: 12, marginTop: 4 } }, 'BY CATEGORY'),
            summaryData.map(function(item, index) {
              var pct = grandTotal > 0 ? (item.total / grandTotal) : 0;
              var pctStr = Math.round(pct * 100) + '%';
              return React.createElement(TouchableOpacity, {
                key: item.category.id,
                onPress: function() { state.setSelectedCat(item.category); },
                style: styles.summaryCard,
                componentId: 'summary-cat-' + item.category.id
              },
                React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 } },
                  React.createElement(View, { style: { width: 44, height: 44, borderRadius: 22, backgroundColor: (item.category.color || accentColor) + '20', alignItems: 'center', justifyContent: 'center', marginRight: 12 } },
                    React.createElement(View, { style: { width: 20, height: 20, borderRadius: 10, backgroundColor: item.category.color || accentColor } })
                  ),
                  React.createElement(View, { style: { flex: 1 } },
                    React.createElement(Text, { style: { fontSize: 16, fontWeight: '700', color: textPrimary } }, item.category.name),
                    React.createElement(Text, { style: { fontSize: 12, color: textSecondary, marginTop: 1 } }, String(item.count) + ' transaction' + (item.count !== 1 ? 's' : ''))
                  ),
                  React.createElement(View, { style: { alignItems: 'flex-end' } },
                    React.createElement(Text, { style: { fontSize: 18, fontWeight: '800', color: textPrimary } }, formatCurrency(item.total)),
                    React.createElement(Text, { style: { fontSize: 12, fontWeight: '600', color: item.category.color || accentColor, marginTop: 1 } }, pctStr)
                  )
                ),
                React.createElement(View, { style: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' } },
                  React.createElement(View, { style: { height: 6, width: pctStr, backgroundColor: item.category.color || accentColor, borderRadius: 3 } })
                )
              );
            })
          ),
      React.createElement(CategoryTransactionsModal, {
        visible: !!state.selectedCat,
        onClose: function() { state.setSelectedCat(null); },
        category: state.selectedCat,
        transactions: state.transactions,
        insetsTop: insets.top, insetsBottom: insets.bottom,
        onDeleteTransaction: handleDeleteTx
      })
    );
  };
  // @end:SummaryScreen

  // @section:CategoriesScreen-state @depends:[ThemeContext]
  var useCategoriesState = function() {
    var themeCtx = useTheme();
    var theme = themeCtx.theme;
    var categoriesQuery = useQuery('categories');
    var transactionsQuery = useQuery('transactions');
    var showAddCatState = useState(false);
    return {
      theme: theme,
      categories: categoriesQuery.data || [],
      catLoading: categoriesQuery.loading,
      refetchCats: categoriesQuery.refetch,
      transactions: transactionsQuery.data || [],
      showAddCat: showAddCatState[0], setShowAddCat: showAddCatState[1]
    };
  };
  // @end:CategoriesScreen-state

  // @section:CategoriesScreen @depends:[CategoriesScreen-state,AddCategoryModal,helpers,styles]
  var CategoriesScreen = function(props) {
    var state = useCategoriesState();
    var insets = useSafeAreaInsets();
    var insertCat = useMutation('categories', 'insert');
    var insertCatMutate = insertCat.mutate;
    var deleteCat = useMutation('categories', 'delete');
    var deleteCatMutate = deleteCat.mutate;
    var fabBottom = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + FAB_SPACING);
    var scrollBottomPadding = Platform.OS === 'web' ? WEB_TAB_MENU_PADDING : (TAB_MENU_HEIGHT + insets.bottom + SCROLL_EXTRA_PADDING + 60);

    var txCountMap = useMemo(function() {
      var map = {};
      (state.transactions || []).forEach(function(tx) {
        map[tx.category_id] = (map[tx.category_id] || 0) + 1;
      });
      return map;
    }, [state.transactions]);

    var txTotalMap = useMemo(function() {
      var map = {};
      (state.transactions || []).forEach(function(tx) {
        map[tx.category_id] = (map[tx.category_id] || 0) + (parseFloat(tx.amount) || 0);
      });
      return map;
    }, [state.transactions]);

    var handleSaveCat = function(data) {
      insertCatMutate({ id: generateId(), name: data.name, color: data.color })
        .then(function() {
          state.refetchCats();
          state.setShowAddCat(false);
        })
        .catch(function(err) {
          Platform.OS === 'web' ? window.alert('Error: ' + err.message) : Alert.alert('Error', err.message);
        });
    };

    var handleDeleteCat = function(catId, catName) {
      var doDelete = function() {
        deleteCatMutate({ id: catId }).then(function() { state.refetchCats(); }).catch(function(err) {
          Platform.OS === 'web' ? window.alert(err.message) : Alert.alert('Error', err.message);
        });
      };
      var msg = 'Delete "' + catName + '"? All associated transactions will also be removed.';
      if (Platform.OS === 'web') {
        if (window.confirm(msg)) doDelete();
      } else {
        Alert.alert('Delete Category', msg, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete }
        ]);
      }
    };

    if (state.catLoading) {
      return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor, alignItems: 'center', justifyContent: 'center' }, componentId: 'cat-loading' },
        React.createElement(ActivityIndicator, { size: 'large', color: primaryColor })
      );
    }

    return React.createElement(View, { style: { flex: 1, backgroundColor: backgroundColor }, componentId: 'categories-screen' },
      React.createElement(View, { style: [styles.screenHeader, { paddingTop: insets.top + 12 }] },
        React.createElement(Text, { style: styles.screenTitle, componentId: 'cat-screen-title' }, 'Categories')
      ),
      React.createElement(View, { style: { paddingHorizontal: 16, paddingVertical: 12 } },
        React.createElement(View, { style: { backgroundColor: cardColor, borderRadius: 12, padding: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 } },
          React.createElement(View, { style: { flex: 1, alignItems: 'center' } },
            React.createElement(Text, { style: { fontSize: 24, fontWeight: '800', color: textPrimary } }, String(state.categories.length)),
            React.createElement(Text, { style: { fontSize: 12, color: textSecondary, marginTop: 2 } }, 'Categories')
          ),
          React.createElement(View, { style: { width: 1, backgroundColor: '#E2E8F0' } }),
          React.createElement(View, { style: { flex: 1, alignItems: 'center' } },
            React.createElement(Text, { style: { fontSize: 24, fontWeight: '800', color: primaryColor } }, String(state.transactions.length)),
            React.createElement(Text, { style: { fontSize: 12, color: textSecondary, marginTop: 2 } }, 'Transactions')
          )
        )
      ),
      state.categories.length === 0
        ? React.createElement(View, { style: [styles.emptyState, { marginTop: 40 }], componentId: 'cat-empty' },
            React.createElement(MaterialIcons, { name: 'label-off', size: 64, color: '#CBD5E1' }),
            React.createElement(Text, { style: styles.emptyTitle }, 'No Categories'),
            React.createElement(Text, { style: styles.emptySubtitle }, 'Create categories to organize your spending.')
          )
        : React.createElement(ScrollView, { style: { flex: 1 }, contentContainerStyle: { paddingHorizontal: 16, paddingBottom: scrollBottomPadding }, showsVerticalScrollIndicator: false },
            state.categories.map(function(cat) {
              var count = txCountMap[cat.id] || 0;
              var total = txTotalMap[cat.id] || 0;
              return React.createElement(View, { key: cat.id, style: styles.catCard, componentId: 'cat-item-' + cat.id },
                React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', flex: 1 } },
                  React.createElement(View, { style: { width: 48, height: 48, borderRadius: 24, backgroundColor: (cat.color || accentColor) + '22', alignItems: 'center', justifyContent: 'center', marginRight: 14 } },
                    React.createElement(View, { style: { width: 22, height: 22, borderRadius: 11, backgroundColor: cat.color || accentColor } })
                  ),
                  React.createElement(View, { style: { flex: 1 } },
                    React.createElement(Text, { style: { fontSize: 16, fontWeight: '700', color: textPrimary } }, cat.name),
                    React.createElement(Text, { style: { fontSize: 13, color: textSecondary, marginTop: 2 } }, String(count) + ' transaction' + (count !== 1 ? 's' : '') + (count > 0 ? (' · ' + formatCurrency(total)) : ''))
                  )
                ),
                React.createElement(TouchableOpacity, {
                  onPress: function() { handleDeleteCat(cat.id, cat.name); },
                  style: { padding: 8 },
                  componentId: 'delete-cat-' + cat.id
                },
                  React.createElement(MaterialIcons, { name: 'delete-outline', size: 22, color: '#CBD5E1' })
                )
              );
            })
          ),
      React.createElement(TouchableOpacity, {
        onPress: function() { state.setShowAddCat(true); },
        style: [styles.fab, { bottom: fabBottom, backgroundColor: accentColor }],
        componentId: 'add-cat-fab'
      },
        React.createElement(MaterialIcons, { name: 'add', size: 28, color: '#FFFFFF' })
      ),
      React.createElement(AddCategoryModal, { visible: state.showAddCat, onClose: function() { state.setShowAddCat(false); }, onSave: handleSaveCat, insetsBottom: insets.bottom })
    );
  };
  // @end:CategoriesScreen

  // @section:styles @depends:[theme]
  const styles = StyleSheet.create({
    screenHeader: {
      backgroundColor: primaryColor,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    screenTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.3
    },
    monthSummaryCard: {
      backgroundColor: cardColor,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 14,
      padding: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3
    },
    txCard: {
      backgroundColor: cardColor,
      borderRadius: 12,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2
    },
    catCard: {
      backgroundColor: cardColor,
      borderRadius: 14,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2
    },
    summaryCard: {
      backgroundColor: cardColor,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3
    },
    totalBanner: {
      backgroundColor: primaryColor,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6
    },
    fab: {
      position: 'absolute',
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 32
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: textPrimary,
      marginTop: 16,
      textAlign: 'center'
    },
    emptySubtitle: {
      fontSize: 14,
      color: textSecondary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    textInput: {
      borderWidth: 1.5,
      borderColor: '#CBD5E1',
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: textPrimary,
      backgroundColor: '#F8FAFC',
      marginBottom: 4
    },
    textArea: {
      borderWidth: 1.5,
      borderColor: '#CBD5E1',
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: textPrimary,
      backgroundColor: '#F8FAFC',
      minHeight: 80
    },
    primaryBtn: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 6
    }
  });
  // @end:styles

  // @section:TabNavigator @depends:[TransactionsScreen,SummaryScreen,CategoriesScreen,navigation-setup,styles]
  var TabNavigator = function() {
    var insets = useSafeAreaInsets();
    return React.createElement(View, { style: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' } },
      React.createElement(Tab.Navigator, {
        screenOptions: {
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            height: Platform.OS === 'web' ? TAB_MENU_HEIGHT : TAB_MENU_HEIGHT + insets.bottom,
            paddingBottom: 0,
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            backgroundColor: cardColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8
          },
          tabBarItemStyle: { padding: 0 },
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: textSecondary,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
        }
      },
        React.createElement(Tab.Screen, {
          name: 'Transactions',
          component: TransactionsScreen,
          options: {
            tabBarLabel: 'Transactions',
            tabBarIcon: function(p) { return React.createElement(MaterialIcons, { name: 'receipt-long', size: 24, color: p.color }); }
          }
        }),
        React.createElement(Tab.Screen, {
          name: 'Summary',
          component: SummaryScreen,
          options: {
            tabBarLabel: 'Summary',
            tabBarIcon: function(p) { return React.createElement(MaterialIcons, { name: 'pie-chart', size: 24, color: p.color }); }
          }
        }),
        React.createElement(Tab.Screen, {
          name: 'Categories',
          component: CategoriesScreen,
          options: {
            tabBarLabel: 'Categories',
            tabBarIcon: function(p) { return React.createElement(MaterialIcons, { name: 'label', size: 24, color: p.color }); }
          }
        })
      )
    );
  };
  // @end:TabNavigator

  // @section:return @depends:[ThemeProvider,TabNavigator]
  return React.createElement(ThemeProvider, null,
    React.createElement(View, { style: { flex: 1, width: '100%', height: '100%' } },
      React.createElement(StatusBar, { barStyle: 'light-content', backgroundColor: primaryColor }),
      React.createElement(TabNavigator)
    )
  );
  // @end:return
};
return ComponentFunctio
