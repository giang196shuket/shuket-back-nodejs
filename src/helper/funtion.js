const userModel = require("../model/user");

async function mergeRoleList(arr_1, arr_2, has_per = true) {
  var list = [];
  var cate_lv1 = {};
  var cate_lv2 = {};
  for (var i = 0; i < arr_1.length; i++) {
      var r = arr_1[i];
      if (arr_2.includes(r['U_CATE_CODE'])) {
          r['HAS_PER'] = has_per;
      } else {
          r['HAS_PER'] = !has_per;
      }
      if (r['U_CATE_DEPT'] == 3) {
          if (!cate_lv2?.hasOwnProperty(r['U_CATE_PCD'])) {
              var row2 = await userModel.selectProgByCode(r['U_CATE_PCD']);
              if (row2.length > 0) {
                  cate_lv2[r['U_CATE_PCD']] = row2;
              }
          } else {
              var row2 = cate_lv2[r['U_CATE_PCD']];
          }
          if (row2.length > 0) {
              if (!cate_lv1?.hasOwnProperty(row2['U_CATE_PCD'])) {
                  var row1 = await userModel.selectProgByCode(row2['U_CATE_PCD']);
                  if (row1.length > 0) {
                      cate_lv1[row2['U_CATE_PCD']] = row1;
                  }
              } else {
                  var row1 = cate_lv1[row2['U_CATE_PCD']];
              }
              if (!list?.hasOwnProperty(row1['U_CATE_CODE'])) {
                  list[row1['U_CATE_CODE']] = {
                      'code': row1['U_CATE_CODE'],
                      'names': {
                          'vn': row1['U_CATE_NAME'],
                          'en': row1['U_CATE_NAME_EN'],
                          'kr': row1['U_CATE_NAME_KR']
                      }
                  };
              }
              if (!list[row1['U_CATE_CODE']]['items']?.hasOwnProperty(row2['U_CATE_CODE'])) {
                  list[row1['U_CATE_CODE']]['items'][row2['U_CATE_CODE']] = {
                      'code': row2['U_CATE_CODE'],
                      'names': {
                          'vn': row2['U_CATE_NAME'],
                          'en': row2['U_CATE_NAME_EN'],
                          'kr': row2['U_CATE_NAME_KR']
                      }
                  };
              }
              list[row1['U_CATE_CODE']]['items'][row2['U_CATE_CODE']]['items'][r['U_CATE_CODE']] = {
                  'code': r['U_CATE_CODE'],
                  'names': {
                      'vn': r['U_CATE_NAME'],
                      'en': r['U_CATE_NAME_EN'],
                      'kr': r['U_CATE_NAME_KR']
                  },
                  'chk_flag': r['HAS_PER']
              };
          }
      } else if (r['U_CATE_DEPT'] == 2) {
          if (!cate_lv1?.hasOwnProperty(r['U_CATE_PCD'])) {
              var r1 = await userModel.selectProgByCode(r['U_CATE_PCD']);
              if (r1.length > 0) {
                  cate_lv1[r1['U_CATE_CODE']] = r1;
              }
          } else {
              var r1 = cate_lv1[r['U_CATE_PCD']];
          }
          if (!list?.hasOwnProperty(r1['U_CATE_CODE'])) {
              list[r1['U_CATE_CODE']] = {
                  'code': r1['U_CATE_CODE'],
                  'names': {
                      'vn': r1['U_CATE_NAME'],
                      'en': r1['U_CATE_NAME_EN'],
                      'kr': r1['U_CATE_NAME_KR']
                  }
              };
          }
          list[r1['U_CATE_CODE']]['items'][r['U_CATE_CODE']] = {
              'code': r['U_CATE_CODE'],
              'names': {
                  'vn': r['U_CATE_NAME'],
                  'en': r['U_CATE_NAME_EN'],
                  'kr': r['U_CATE_NAME_KR']
              },
              'chk_flag': r['HAS_PER']
          };
      } else {
          list[r['U_CATE_CODE']] = {
              'code': r['U_CATE_CODE'],
              'names': {
                  'vn': r['U_CATE_NAME'],
                  'en': r['U_CATE_NAME_EN'],
                  'kr': r['U_CATE_NAME_KR']
              },
              'chk_flag': r['HAS_PER']
          };
      }
  }
  var list_progs = [];
  var a = b = c = 0;
  for (var i = 0; i < list.length; i++) {
      b = c = 0;
      list_progs[a] = {
          'code': list[i]['code'],
          'names': list[i]['names']
      };
      if (list[i]?.hasOwnProperty('chk_flag')) {
          list_progs[a]['chk_flag'] = list[i]['chk_flag'];
      }
      if (list[i]['items'].length > 0) {
          for (var j = 0; j < list[i]['items'].length; j++) {
              c = 0;
              list_progs[a]['items'][b] = {
                  'code': list[i]['items'][j]['code'],
                  'names': list[i]['items'][j]['names'],
              };
              if (list[i]['items'][j]?.hasOwnProperty('chk_flag')) {
                  list_progs[a]['items'][b]['chk_flag'] = list[i]['items'][j]['chk_flag'];
              }
              if (list[i]['items'][j]['items'].length > 0) {
                  for (var k = 0; k < list[i]['items'][j]['items'].length; k++) {
                      list_progs[a]['items'][b]['items'][c] = {
                          'code': list[i]['items'][j]['items'][k]['code'],
                          'names': list[i]['items'][j]['items'][k]['names'],
                      };
                      if (list[i]['items'][j]['items'][k]?.hasOwnProperty('chk_flag')) {
                          list_progs[a]['items'][b]['items'][c]['chk_flag'] = list[i]['items'][j]['items'][k]['chk_flag'];
                      }
                      c++;
                  }
              }
              b++;
          }
      }
      a++;
  }
  return list_progs;
}




module.exports = { mergeRoleList };
