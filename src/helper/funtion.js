const userModel = require("../model/user");

async function mergeRoleList(arrUser, arrCodeLevel, hasPer = true) {
  console.time("AVOID DUP");
  const arrTemp = [...arrUser, ...arrCodeLevel];
  // chống trùng lặp khi merge 2 mảng
  let arrMerge = [];
  let uniqueObject = {};
  for (let i in arrTemp) {
    objTitle = arrTemp[i]["U_CATE_CODE"];
    uniqueObject[objTitle] = arrTemp[i];
  }
  for (i in uniqueObject) {
    arrMerge.push(uniqueObject[i]);
  }
  // chống trùng lặp khi merge 2 mảng
  console.timeEnd("AVOID DUP");

  let list = [];
  let listDept2 = [];

  let listSub = [];

  console.time("SUB");
  //lấy danh sách sub các thằng dept = 3 từ mảng chính
  for await (const cateUser of arrMerge) {
    if (cateUser.U_CATE_DEPT === 3) {
      listSub.push({
        code: cateUser.U_CATE_CODE,
        route: cateUser.URL,
        sort3: cateUser.SORT_ORDER,
        parent: cateUser.U_CATE_PCD,
        name: {
          vn: cateUser.U_CATE_NAME,
          en: cateUser.U_CATE_NAME_EN,
          kr: cateUser.U_CATE_NAME_KR,
        },
      });
    }
  }
  //lấy danh sách sub
  console.timeEnd("SUB");
  // arrMerge ko chứ các dept2 là cha của các thằng dept3 => kiếm bằng query
  // arrMerge ko chứ các dept1 là cha của các thằng dept2 => kiếm bằng query
  console.time("MERGE");
  for  (const cateUser of arrMerge) {
    //lấy dữ liệu lớp cha của thằng hiện tại
    let data = null;
    if (cateUser.U_CATE_DEPT === 3) {
      const parentOfDept3 = listDept2.find(
        (fn) => fn.U_CATE_CODE === cateUser.U_CATE_PCD
      );
      if (parentOfDept3) {
        data = parentOfDept3;
      } else {
        data = await userModel.selectProgByCode(cateUser.U_CATE_PCD); // thằng dept 2 của dept 3 hiện tại
        listDept2.push(data);
      }
      
      const parentIndex = list.findIndex(
        (ls) => ls.group_code === data.U_CATE_PCD
      ); // kiếm thằng cha  dept 1 của dept 2
      if (list[parentIndex]) {
        if (
          !list[parentIndex].group_items.find(
            (ls) => ls.code === data.U_CATE_CODE
          )
        ) {
          // nếu có rồi ko đẩy vô nữa
          if (listSub.find((su) => su.parent === data.U_CATE_CODE)) {
            list[parentIndex].group_items.push({
              code: data.U_CATE_CODE,
              route: data.URL,
              sort2: data.SORT_ORDER,
              parent: data.U_CATE_PCD,
              name: {
                vn: data.U_CATE_NAME,
                en: data.U_CATE_NAME_EN,
                kr: data.U_CATE_NAME_KR,
              },
              sub_items: listSub.filter((su) => su.parent === data.U_CATE_CODE),
            });
          } else {
            list[parentIndex].group_items.push({
              code: data.U_CATE_CODE,
              route: data.URL,
              sort2: data.SORT_ORDER,
              parent: data.U_CATE_PCD,
              name: {
                vn: data.U_CATE_NAME,
                en: data.U_CATE_NAME_EN,
                kr: data.U_CATE_NAME_KR,
              },
            });
          }
        }
      }
    } else if (cateUser.U_CATE_DEPT === 2) {
      //lấy dữ liệu lớp cha của thằng hiện tại
      if (!list.find((fn) => fn.group_code === cateUser.U_CATE_PCD)) {
        const data = await userModel.selectProgByCode(cateUser.U_CATE_PCD);
        if (!list.find((ls) => ls.group_code === data.U_CATE_CODE)) {
          let group_items = [];
          if (listSub.find((su) => su.parent === data.U_CATE_CODE)) {
            group_items = arrMerge
              .filter((cu) => cu.U_CATE_PCD === data.U_CATE_CODE)
              .map(function (cate) {
                return {
                  code: cate.U_CATE_CODE,
                  route: cate.URL,
                  sort2: cate.SORT_ORDER,
                  parent: cate.U_CATE_PCD,
                  name: {
                    vn: cate.U_CATE_NAME,
                    en: cate.U_CATE_NAME_EN,
                    kr: cate.U_CATE_NAME_KR,
                  },
                  sub_items: listSub.filter(
                    (su) => su.parent === data.U_CATE_CODE
                  ),
                };
              });
          } else {
            group_items = arrMerge
              .filter((cu) => cu.U_CATE_PCD === data.U_CATE_CODE)
              .map(function (cate) {
                return {
                  code: cate.U_CATE_CODE,
                  route: cate.URL,
                  sort2: cate.SORT_ORDER,
                  parent: cate.U_CATE_PCD,
                  name: {
                    vn: cate.U_CATE_NAME,
                    en: cate.U_CATE_NAME_EN,
                    kr: cate.U_CATE_NAME_KR,
                  },
                };
              });
          }

          list.push({
            group_code: data.U_CATE_CODE,
            group_route: data.URL,
            group_sort: data.SORT_ORDER,
            group_names: {
              vn: data.U_CATE_NAME,
              en: data.U_CATE_NAME_EN,
              kr: data.U_CATE_NAME_KR,
            },
            group_items: group_items,
          });
        }
      }
    }
  }

  console.timeEnd("MERGE");

  console.time("SORT");
  function compareBySortOrder(a, b) {
    return a.sort2 - b.sort2;
  }

  for (let i = 0; i < list.length; i++) {
    list[i].group_items.sort(compareBySortOrder);
  }
  console.timeEnd("SORT");

  return list;
}

module.exports = { mergeRoleList };
