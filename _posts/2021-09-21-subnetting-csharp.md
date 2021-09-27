---
layout:     post
title:      CIDR Subnetting 101 in C#
summary:    Conquer subnetting with C#.
categories: csharp devops
---

{{page.summary}}

## Subnet mask

A typical binary mask is this:

```
11111111.11111111.11111111.00000000
```

This is binary and translates to `255.255.255.0`.
But the binary representation is much more interesting
when subnetting. Especially for the subnet mask.

### Anatomy

IP version four consists of four octets typically separated by a dot.
An octet is composed of eight bits.

```
 Binary  11000000.10101000.00000000.00011001
Decimal    192      168       0       25
```

A subnet mask tells the net what part of the IP address can be used
for the hosts i.e. devices.

Every bit that's `true` reserves this bit for the network.
When you receive it or administering it, you may not change it that
part of the address.

Mask before subnetting:

```
Mask 11111111.11111111.11111111.00000000
```

Subnet mask when subnetting:

```

                              Subnet
                                _
                               | |
Mask 11111111.11111111.11111111.11000000
     |___________________________||____|
               Network part        Host part

```

When subnetting you give up some of bits of the host in
favor of the subnet.

When you surrender two bits, you allow for four subnets
because the bits for the subnet can be any of the following
combinations:

```
00
10
01
11
```

The formula to get the number of combinations is `2^n`
where `n` is the number of bits available.

Now one also knows how to calculate the number of hosts.

Six bits are left for the hosts except you need to subtract
two hosts per subnet because each first IP is reserved for
identifying the network (Subnet ID) and the last is the
broadcast IP.

```
2^n-2
```

In the example above this translates to `2^6-2`. So, there
are 62 hosts per subnet plus one subnet ID and broadcast for
each.

Therefore the number of subnets you want to create need to
be a power of 2. In fact only the following number of subnets
work:

```
2147483648, 1073741824, 536870912, 268435456, 134217728, 67108864,
33554432, 16777216, 8388608, 4194304, 2097152, 1048576, 524288,
262144, 131072, 65536, 32768, 16384, 8192, 4096, 2048, 1024, 512,
256, 128, 64, 32, 16, 8, 4, 2, 1
```

## IP address to binary representation

In C# chunked by octets. Actually you could make this a array
of boolean arrays. This would better fit the binary scheme.

```cs
private static uint[][] ToBin(string ip)
{
    return Array.ConvertAll(ip.Split("."), val => ToBin(UInt32.Parse(val)));
}
```

## Example in C#

Are two IP addresses in the same subnet?

```cs
var subnetMask = ToBin("255.255.255.0");
var ipAddress1 = ToBin("192.168.0.15");
var ipAddress2 = ToBin("192.168.0.099");

for (var i = 0; i < subnetMask.Length; i++) {
    for (var k = 0; k < subnetMask[i].Length; k++) {
        if (subnetMask[i][k] == 0) {
            break;
        } else if (ipAddress1[i][k] != ipAddress2[i][k]) {
            return false;
        }
    }
}

return true;
```

## CIDR notation

There's CIDR notation with IP ending with slash and a number
representing the number of leading bits reserved for the network.

I.e. 192.168.0.0/24 would reserve the first 24 bits like a subnet
mask of 255.255.255.0 which is 11111111.11111111.11111111.00000000 in binary.

```cs
private static uint[][] CidrToSubnetMask(uint cidr)
{
    // from cidr to subnet mask
    uint[] subnetMaskBinary = new uint[32];
    for (int i = 0; i < cidr; i++) {
        subnetMaskBinary[i] = 1;
    }
    uint[][] subnetMaskBinaryChunked = new uint[4][];
    int bitCounter1 = 0;
    for (int i = 0; i < 4; i++) {
        uint[] chunk = new uint[8];
        for (int k = 0; k < 8; k++) {
            chunk[k] = subnetMaskBinary[bitCounter1++];
        }
        subnetMaskBinaryChunked[i] = chunk;
    }
    return subnetMaskBinaryChunked;
}
```


## IP address arithmetic

A better representation of IP addresses is an unsigned integer.
Because in the end that's what IP addresses are.

### Bidirectional conversion

```cs
private static string ToIp(long bytes) {
    return
        ((bytes >> 24) & 0xFF) + "." +
        ((bytes >> 16) & 0xFF) + "." +
        ((bytes >> 8 ) & 0xFF) + "." +
        ( bytes        & 0xFF);
}
```

```cs
private static uint ToInt(string ip)
{
    var dec = Array.ConvertAll(ip.Split("."), i => Convert.ToUInt32(i));
    return (dec[0] << 24)
         | (dec[1] << 16)
         | (dec[2] <<  8)
         |  dec[3];
}
```

The latter shifting the bits left and applying bitwise OR.

```cs
private static string pad(int n) {
  var str = "";
  for (var i = 0; i < n; i++) {
    str += " ";
  }
  return str;
}

static void Main(string[] args) {
  var ip = "192.168.178.1";
  var dec = Array.ConvertAll(ip.Split("."), i => Convert.ToUInt32(i));
  Console.WriteLine(Convert.ToString(dec[0] << 24, 2));
  Console.WriteLine(pad(8) + Convert.ToString(dec[1] << 16, 2));
  Console.WriteLine(pad(16) + Convert.ToString(dec[2] << 8, 2));
  Console.WriteLine(pad(24) + "       " + Convert.ToString(dec[3], 2));
}
```

Output:

```
11000000000000000000000000000000
        101010000000000000000000
                1011001000000000
                               1
```

## Learn more

https://www.mathsisfun.com/binary-number-system.html
https://docs.microsoft.com/en-us/troubleshoot/windows-client/networking/tcpip-addressing-and-subnetting
https://www.itgeared.com/articles/1347-cidr-and-subnetting-tutorial/
https://www.geeksforgeeks.org/introduction-to-subnetting/
https://www.freecodecamp.org/news/subnet-cheat-sheet-24-subnet-mask-30-26-27-29-and-other-ip-address-cidr-network-references/

