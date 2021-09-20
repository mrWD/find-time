import * as React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Title, Subheading, Button, ToggleButton, TextInput } from 'react-native-paper';

import { View, Text } from '../components/Themed';
import { RootTabScreenProps } from '../types';

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24 * MINUTES_IN_HOUR;

const weekDayNames = [
  'Mon', 'Tus', 'Wed',
  'Thu', 'Fri', 'Sat',
  'Sun',
];

const monthNames = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec',
];

const MyTimePicker = (props: any) => {
  const [form, setForm] = React.useState({
    hours: `${Math.floor(Number(props.value) / MINUTES_IN_HOUR)}`,
    minutes: `${Number(props.value) % MINUTES_IN_HOUR}`,
  });

  const handleFormUpdate = (prop: 'hours' | 'minutes', value: string) => {
    setForm((prevForm) => {
      if (prop !== 'minutes' || value === '') {
        return { ...prevForm, [prop]: value };
      }

      const hours = Number(value) < MINUTES_IN_HOUR ? prevForm.hours : `${Math.floor(Number(value) / MINUTES_IN_HOUR)}`;
      const minutes = `${Number(value) % MINUTES_IN_HOUR}`;

      return { hours, minutes };
    });

    props.onChangeText(Number(form.hours) + Number(form.minutes));
  };

  return (
    <View>
      <Text>{props.label}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          value={form.hours}
          onChangeText={hours => handleFormUpdate('hours', hours)}
        />

        <Text style={{ color: 'white' }}>h</Text>

        <TextInput
          value={form.minutes}
          onChangeText={minutes => handleFormUpdate('minutes', minutes)}
        />

        <Text style={{ color: 'white' }}>m</Text>
      </View>
    </View>
  );
};

const CommonComponent = (props: any) => {
  const handleTouch = (newIndex: number) => {
    if (!props.checkedList.includes(newIndex)) {
      props.onUpdate([...props.checkedList, newIndex]);
      return;
    }

    props.onUpdate(props.checkedList.filter((index: number) => index !== newIndex));
  };

  const itemList = Array(props.length).fill(null).map((_, index) => (
    <Button
      mode={props.checkedList.includes(index) ? 'contained' : 'outlined'}
      key={index}
      onPress={() => handleTouch(index)}
    >
      {props.names[index]}
    </Button>
  ));

  return <View style={datesStyles.container}>{itemList}</View>;
};

const WeekDayList = (props: any) => {
  return (
    <CommonComponent
      {...props}
      length={weekDayNames.length}
      names={weekDayNames}
      checkedList={props.checkedWeekDayList}
    />
  );
};

const MonthList = (props: any) => {
  return (
    <CommonComponent
      {...props}
      length={monthNames.length}
      names={monthNames}
      checkedList={props.checkedMonthList}
    />
  );
};

const defaultForm = {
  isEveryMonth: false,
  sleepingTime: '480',
  actualWorkTime: '480',
  workTime: '480',
  lunchTime: '60',
  wayToJob: '30',
  wayToHome: '30',
  monthList: [],
  weekDayList: [],
};

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [form, setForm] = React.useState(defaultForm);
  const [additionalFields, setAdditionalFields] = React.useState<string[]>([]);
  const [newField, setNewField] = React.useState('');

  const handleFormUpdate = (prop: string, value: any) => {
    setForm((oldForm) => ({ ...oldForm, [prop]: value }));
  };

  const handleAddField = (name: string) => {
    setAdditionalFields([...additionalFields, name]);
    handleFormUpdate(name, '');
    setNewField('');
  };

  const getFreeTime = () => {
    const wayToWorkAndHome = Number(form.wayToJob) + Number(form.wayToHome);
    const timeOnWork = Number(form.actualWorkTime) + Number(form.lunchTime);
    return (HOURS_IN_DAY - Number(form.sleepingTime) - timeOnWork - wayToWorkAndHome) / MINUTES_IN_HOUR;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Title style={styles.title}>Let's watch when you are busy</Title>

        <Title>Do you work every month?</Title>

        <ToggleButton.Row
          onValueChange={(value) => handleFormUpdate('isEveryMonth', value)}
          value={form.isEveryMonth}
        >
          <ToggleButton icon="check" value={true}></ToggleButton>
          <ToggleButton icon="close" value={false}></ToggleButton>
        </ToggleButton.Row>

        {form.isEveryMonth && (
          <>
            <Title>Which months do you work?</Title>
      
            <MonthList
              style={{ marginBottom: 16 }}
              checkedMonthList={form.monthList}
              onUpdate={(newList: any) => handleFormUpdate('monthList', newList)}
            />
          </>
        )}

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Title>Which weekdays do you work?</Title>

        <WeekDayList
          checkedWeekDayList={form.weekDayList}
          onUpdate={(newList: any) => handleFormUpdate('weekDayList', newList)}
        />

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <View
          style={{
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          }}
        >
          <MyTimePicker
            label="How long do you work (exclude the lunch time)?"
            value={form.actualWorkTime}
            onChangeText={(actualWorkTime: any) => handleFormUpdate('actualWorkTime', actualWorkTime)}
          />

          <MyTimePicker
            label="How long do you have to work by law (exclude the lunch time)?"
            value={form.workTime}
            onChangeText={(workTime: any) => handleFormUpdate('workTime', workTime)}
          />

          <MyTimePicker
            label="How long do you sleep?"
            value={form.sleepingTime}
            onChangeText={(sleepingTime: string) => handleFormUpdate('sleepingTime', sleepingTime)}
          />

          <MyTimePicker
            label="How long do you have to work by law?"
            value={form.workTime}
            onChangeText={(workTime: string) => handleFormUpdate('workTime', workTime)}
          />

          <MyTimePicker
            label="How long do you have lunch during the working day?"
            value={form.lunchTime}
            onChangeText={(lunchTime: string) => handleFormUpdate('lunchTime', lunchTime)}
          />

          <MyTimePicker
            label="How much does it take to get to your job?"
            value={form.wayToJob}
            onChangeText={(wayToJob: string) => handleFormUpdate('wayToJob', wayToJob)}
          />

          <MyTimePicker
            label="How much does it take to get to your home?"
            value={form.wayToHome}
            onChangeText={(wayToHome: string) => handleFormUpdate('wayToHome', wayToHome)}
          />
        </View>

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Title>What do you usually do else?</Title>
        <Subheading style={{ textAlign: 'center' }}>(play computer games, surfing internet, instagram, watching youtube, playing football, watching email)</Subheading>

        {(additionalFields).map((prop, i) => (
          <View
            style={{
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            }}
            key={i}
          >
            <MyTimePicker
              label={`How much do you spend for "${prop}"?`}
              value={form[prop]}
              onChangeText={(value: string) => handleFormUpdate(prop, value)}
            />
          </View>
        ))}

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <View
          style={{
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          }}
        >
          <TextInput
            label="Activity name"
            value={newField}
            onChangeText={setNewField}
          />

          <Button onPress={() => handleAddField(newField)}>Add</Button>
        </View>

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Text>{getFreeTime()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scrollView: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

const datesStyles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
