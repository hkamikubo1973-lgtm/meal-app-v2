import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { DutyType } from '../types/DutyType';

type Props = {
  uuid: string;
  dutyDate: string;
  dutyType: DutyType | null;
  jumpText: string | null;
  baseDate: string | null;
  pattern: DutyType[] | null;
  onChange: (
    newDate: string,
    jumpType?: 'prev' | 'next' | 'long-prev' | 'long-next'
  ) => void;
  onSavePattern: (
    baseDate: string,
    pattern: DutyType[]
  ) => Promise<void>;
  onSetOverride: (type: DutyType) => Promise<void>;
  onResetOverride: () => Promise<void>;
};

export default function DutySearchBar({
  dutyDate,
  dutyType,
  jumpText,
  baseDate,
  pattern,
  onChange,
  onSavePattern,
  onSetOverride,
  onResetOverride
}: Props) {

  const [openCycle, setOpenCycle] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [localPattern, setLocalPattern] = useState<DutyType[] | null>(pattern);
  const [localBaseDate, setLocalBaseDate] = useState(baseDate ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalPattern(pattern);
  }, [pattern]);

  useEffect(() => {
    setLocalBaseDate(baseDate ?? '');
  }, [baseDate]);

  const DUTY_LABEL: Record<DutyType, string> = {
    work: '乗務',
    ake: '明け',
    off: '公休',
    paid: '有休',
    absence: '欠勤',
    late: '遅刻',
    leaveEarly: '早退',
    cancel: '取消',
  };

  const nextDuty = (type: DutyType): DutyType => {
    const order: DutyType[] = ['work', 'ake', 'off'];
    const idx = order.indexOf(type);
    return order[(idx + 1) % order.length];
  };

  const cycleInfo = React.useMemo(() => {

    if (!baseDate || !pattern || pattern.length === 0) {
      return null;
    }

    const base = new Date(baseDate);
    const current = new Date(dutyDate);

    const diff = Math.floor(
      (current.getTime() - base.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const length = pattern.length;

    const index =
      ((diff % length) + length) % length;

    return {
      day: index + 1,
      total: length,
      label: pattern[index],
    };

  }, [baseDate, dutyDate, pattern]);

  const changeDateBy = (days: number, jumpType?: string) => {

    const [y, m, d] = dutyDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    date.setDate(date.getDate() + days);

    const newDate =
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0');

    onChange(newDate, jumpType as any);

  };

  const isValidDate = (value: string) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  };

  const handleSave = async () => {

    if (!localPattern) return;

    if (!isValidDate(localBaseDate)) {
      Alert.alert('基準日は YYYY-MM-DD 形式で入力してください');
      return;
    }

    try {

      setSaving(true);

      await onSavePattern(localBaseDate, localPattern);

      setEditMode(false);

      Alert.alert('保存しました');

    } catch {

      Alert.alert('保存失敗');

    } finally {

      setSaving(false);

    }

  };

  return (

<View style={styles.wrapper}>

{/* ヘッダー */}

<View style={styles.headerRow}>
<Text style={styles.headerLeft}>乗務日検索</Text>
<Text style={styles.headerCenter}>{jumpText ?? ''}</Text>
<Text style={styles.headerRight}>※長押しで±30日</Text>
</View>

{/* 日付移動 */}

<View style={styles.row}>

<Pressable
style={styles.button}
onPress={() => changeDateBy(-1)}
onLongPress={() => changeDateBy(-30,'long-prev')}
>
<Text style={styles.buttonText}>◀ 前日</Text>
</Pressable>

<View style={styles.center}>
<Text style={styles.date}>{dutyDate}</Text>
<Text style={styles.dutyType}>
{dutyType && DUTY_LABEL[dutyType]}
</Text>
</View>

<Pressable
style={styles.button}
onPress={() => changeDateBy(1)}
onLongPress={() => changeDateBy(30,'long-next')}
>
<Text style={styles.buttonText}>翌日 ▶</Text>
</Pressable>

</View>

{/* アコーディオン */}

<Pressable
style={styles.accordionToggle}
onPress={() => setOpenCycle(v => !v)}
>
<Text style={styles.accordionText}>
{openCycle
? '▲ 乗務サイクル設定・勤務修正を閉じる'
: '▼ 乗務サイクル設定・勤務修正'}
</Text>
</Pressable>

{openCycle && (

<View style={styles.accordionBox}>

{/* 勤務修正 */}

<View style={styles.overrideBox}>

<Text style={styles.overrideTitle}>
勤務修正
</Text>

<View style={styles.overrideRow}>
{(['work','paid','absence','late','leaveEarly'] as DutyType[])
.map((type) => (

<Pressable
key={type}
style={styles.overrideButton}
onPress={() => onSetOverride(type)}
>
<Text style={styles.overrideText}>
{DUTY_LABEL[type]}
</Text>
</Pressable>

))}
</View>

<View style={styles.cancelRow}>
<Pressable
style={styles.cancelButton}
onPress={onResetOverride}
>
<Text style={styles.cancelText}>
修正解除
</Text>
</Pressable>
</View>

</View>

{/* サイクル設定 */}

<Text style={styles.label}>
基準日（サイクル初日）
</Text>

{!editMode ? (

<Text style={styles.value}>
{localBaseDate || '未設定'}
</Text>

) : (

<TextInput
value={localBaseDate}
onChangeText={setLocalBaseDate}
style={styles.input}
placeholder="YYYY-MM-DD"
/>

)}

{cycleInfo && (

<>
<Text style={styles.cycleInfo}>
サイクル {cycleInfo.day} / {cycleInfo.total} 日目
（{DUTY_LABEL[cycleInfo.label]}）
</Text>

<View style={styles.cycleProgress}>

{pattern && (
<>
<View style={styles.progressRow}>
{pattern.slice(0,10).map((_,i)=>{

const filled = cycleInfo && i < cycleInfo.day;

return (
<View
key={i}
style={[
styles.progressBar,
filled && styles.progressFilled
]}
/>
);

})}
</View>

<View style={styles.progressRow}>
{pattern.slice(10,20).map((_,i)=>{

const index = i + 10;
const filled = cycleInfo && index < cycleInfo.day;

return (
<View
key={index}
style={[
styles.progressBar,
filled && styles.progressFilled
]}
/>
);

})}
</View>
</>
)}

</View>

{localPattern && (

<>
<Text style={[styles.label,{marginTop:14}]}>
パターン
</Text>

<View style={styles.patternRow}>
{localPattern.map((type,index)=>(

<Pressable
key={index}
disabled={!editMode}
onPress={()=>{

const updated=[...localPattern];
updated[index]=nextDuty(type);
setLocalPattern(updated);

}}
style={[
styles.patternChip,
editMode && styles.patternChipEdit
]}
>

<Text style={styles.patternText}>
{DUTY_LABEL[type]}
</Text>

</Pressable>

))}
</View>

<View style={{flexDirection:'row',marginTop:8}}>

{localPattern.length < 20 && (

<Pressable
onPress={()=>setLocalPattern([...localPattern,'work'])}
style={styles.lengthButton}
>
<Text style={styles.lengthButtonText}>＋ 日追加</Text>
</Pressable>

)}

{localPattern.length > 3 && (

<Pressable
onPress={()=>setLocalPattern(localPattern.slice(0,-1))}
style={styles.lengthButton}
>
<Text style={styles.lengthButtonText}>－ 日削除</Text>
</Pressable>

)}

</View>

</>

)}

</>

)}

{!editMode ? (

<Pressable
style={styles.editButton}
onPress={()=>setEditMode(true)}
>
<Text style={styles.editButtonText}>
パターン編集
</Text>
</Pressable>

) : (

<View style={styles.saveRow}>

<Pressable
style={styles.cancelButton}
onPress={()=>{

setLocalPattern(pattern);
setLocalBaseDate(baseDate ?? '');
setEditMode(false);

}}
>
<Text>キャンセル</Text>
</Pressable>

<Pressable
style={styles.saveButton}
onPress={handleSave}
disabled={saving}
>
<Text style={{color:'#fff'}}>
{saving ? '保存中...' : '保存'}
</Text>
</Pressable>

</View>

)}

</View>

)}

</View>

  );
}

const styles = StyleSheet.create({

wrapper:{paddingVertical:14},

headerRow:{
flexDirection:'row',
justifyContent:'space-between',
paddingHorizontal:16
},

headerLeft:{fontSize:18,fontWeight:'bold'},
headerCenter:{fontSize:16,fontWeight:'600'},
headerRight:{fontSize:11,color:'#888'},

row:{
flexDirection:'row',
justifyContent:'space-between',
paddingHorizontal:16,
marginTop:10
},

button:{paddingVertical:8},
buttonText:{fontSize:16},

center:{alignItems:'center'},

date:{fontSize:22,fontWeight:'600'},
dutyType:{fontSize:13,marginTop:2},

accordionToggle:{paddingHorizontal:16,marginTop:12},
accordionText:{fontSize:14,color:'#1976D2'},

accordionBox:{
marginTop:6,
marginHorizontal:16,
padding:12,
backgroundColor:'#F9FAFB',
borderRadius:8,
borderWidth:1,
borderColor:'#E0E0E0'
},

label:{fontSize:12,color:'#666'},
value:{fontSize:16,fontWeight:'600'},

input:{
borderWidth:1,
borderColor:'#ccc',
padding:6,
borderRadius:4,
marginTop:4
},

cycleInfo:{
marginTop:6,
fontSize:13,
color:'#555',
fontWeight:'600'
},

overrideBox:{marginTop:8,alignItems:'center'},
overrideTitle:{fontSize:12,color:'#666',marginBottom:4},

overrideRow:{
flexDirection:'row',
justifyContent:'center',
gap:8
},

overrideButton:{
paddingVertical:6,
paddingHorizontal:10,
backgroundColor:'#E3F2FD',
borderRadius:6
},

overrideText:{fontSize:12,fontWeight:'600'},

patternRow:{
flexDirection:'row',
flexWrap:'wrap',
gap:6,
marginTop:6
},

patternChip:{
paddingVertical:6,
paddingHorizontal:10,
backgroundColor:'#EEE',
borderRadius:6
},

patternChipEdit:{
backgroundColor:'#BBDEFB'
},

patternText:{fontSize:12,fontWeight:'600'},

lengthButton:{
paddingVertical:6,
paddingHorizontal:10,
backgroundColor:'#E0E0E0',
borderRadius:6,
marginRight:6
},

lengthButtonText:{fontSize:12},

editButton:{
marginTop:10,
paddingVertical:8,
backgroundColor:'#E3F2FD',
alignItems:'center',
borderRadius:6
},

editButtonText:{fontWeight:'600'},

saveRow:{
flexDirection:'row',
justifyContent:'space-between',
marginTop:10
},

saveButton:{
paddingVertical:8,
paddingHorizontal:14,
backgroundColor:'#1976D2',
borderRadius:6
},

cancelRow:{
marginTop:8,
alignItems:'center'
},

cancelButton:{
backgroundColor:'#FFEBEE',
paddingVertical:6,
paddingHorizontal:12,
borderRadius:6
},

cancelText:{
color:'#C62828',
fontWeight:'600'
},

cycleProgress:{
marginTop:8
},

progressRow:{
flexDirection:'row'
},

progressBar:{
width:26,
height:16,
marginRight:4,
marginBottom:4,
backgroundColor:'#E0E0E0',
borderRadius:4
},

progressFilled:{
backgroundColor:'#1976D2'
},
});